import { minBy } from 'lodash';
import { ctool, findJokerSpot, GameEvent, generateDeck, getNextPlayer, getPlayerRoundPoints, getPrevPlayer, isJoker, Player, Session, shuffle, sleep, userError, UserError, validateMeld, validateMelds } from 'shared';
import { WebSocket } from 'ws';
import { sendError, sendMessage } from '../networking/socket';
import { updateClients } from './controller';



export function eventHandler(sessions: Record<string, Session>, event: GameEvent, ws: WebSocket) {
    if (!sessions[event.sessionId])
        return sendError(ws, 'Invalid session');
    let session = sessions[event.sessionId];

    try {
        handle();
        updateClients(sessions, event);
    } catch (e) {
        if (e instanceof UserError)
            return sendError(ws, e.message);
        throw e;
    }

    function handle() {
        switch (event.action) {
            case 'connect': return handleConnect();
            case 'disconnect': return handleDisconnect();

            case 'set-ready': return handleSetReady();
            case 'reveal': return handleReveal();
            case 'call-shanghai': return handleCallShanghai();
            case 'draw-deck': return handleDrawDeck();
            case 'draw-discard': return handleDrawDiscard();
            case 'meld': return handleMeld();
            case 'add-to-meld': return handleAddMeld();
            case 'discard': return handleDiscard();

            default: throw userError('Event was not handled properly');
        }
    }

    //#region handlers
    function handleConnect() {
        const player = session.players.find(x => x.id === event.playerId);
        if (!player)
            throw userError('Invalid player id');
        sendMessage(`Player ${player.name} rejoined`, event);
    }

    function handleDisconnect() {
        const player = session.players.find(x => x.id === event.playerId);
        if (!player)
            throw userError('Invalid player id');
        sendMessage(`Player ${player.name} disconnected`, event);
    }



    function handleSetReady() {
        if (session.state !== 'waiting-players' && session.state !== 'round-end')
            throw userError('Cannot set ready state right now');

        const player = session.players.find(x => x.id === event.playerId)!;
        player.isReady = true;
        sendMessage(`Player ${player.name} is ready`, event);

        if (session.players.every(x => x.isReady)) {
            if (session.state === 'waiting-players')
                return startGame();
            return startNextRound();
        }
    }

    function handleReveal() {
        if (session.discard.length !== 0)
            throw userError('Cannot reveal card, discard pile not empty');
        if (session.state !== 'turn-start' && session.state !== 'shanghai-called')
            throw userError('Cannot reveal a card right now');
        if (session.currentPlayerId !== event.playerId)
            throw userError('Cannot reveal on someone else\'s turn');

        // Reset shanghai when new card revealed
        session.state = 'turn-start';
        const card = session.deck.splice(0, 1)[0];
        session.discard.push(card);
        sendMessage(`${currentPlayer().name} revealed ${ctool.longName(card)}`, event);
    }

    function handleCallShanghai() {
        if (session.pendingShanghai)
            throw userError(`Player ${session.players.find(x => x.id === session.pendingShanghai)?.name} already called shanghai`);
        if (session.state !== 'turn-start')
            throw userError('Shanghai is not allowed right now');
        if (event.playerId === session.currentPlayerId)
            throw userError('Current player cannot call shanghai');
        if (event.playerId === getPrevPlayer(session.currentPlayerId, session.players).id)
            throw userError('Can\'t call shanghai on a card you discarded');
        if (session.discard.length === 0)
            throw userError('Discard pile empty, can\'t call shanghai');

        const p = session.players.find(x => x.id === event.playerId)!;
        if (p.melds.length)
            throw userError('You cannot call shanghai after melding');
        if (p.remainingShouts <= 0)
            throw userError('No more shanghais remaining');

        session.pendingShanghai = event.playerId;
        session.state = 'shanghai-called';

        const current = session.players.find(x => x.id === session.currentPlayerId)!;
        if (current.melds.length !== 0) {
            allowShanghai('no-message');
        }

        sendMessage(`${p.name} called shanghai!`, event);
    }

    function handleDrawDeck() {
        if (session.currentPlayerId !== event.playerId)
            throw userError('Cannot draw on opponent\'s turn');
        if (session.state !== 'turn-start' && session.state !== 'shanghai-called')
            throw userError('Cannot draw a card right now');
        if (session.discard.length === 0 && session.deck.length !== 0)
            throw userError('Discard pile empty, reveal a card first');

        if (session.pendingShanghai)
            allowShanghai('message');

        if (session.deck.length === 0 && session.discard.length === 0) {
            sendError(ws, 'Deck and discard pile are empty, card drawing skipped');
            return session.state = 'card-drawn';
        }

        if (session.deck.length === 0)
            reshuffleDeck();

        const player = session.players.find(x => x.id === event.playerId)!;
        const card = session.deck.splice(0, 1)[0];
        player.cards.push(card);
        player.newCards = [card];

        session.state = 'card-drawn';
        sendMessage(`${player.name} drew a card from the deck`, event);
    }

    function handleDrawDiscard() {
        if (session.currentPlayerId !== event.playerId)
            throw userError('Cannot draw on opponent\'s turn');
        if (session.state !== 'turn-start' && session.state !== 'shanghai-called')
            throw userError('Cannot draw from the discard pile right now');
        if (session.discard.length === 0 && session.deck.length === 0) {
            sendError(ws, 'Deck and discard pile are empty, card drawing skipped');
            return session.state = 'card-drawn';
        }

        if (session.discard.length === 0)
            throw userError('Discard pile is empty');

        if (session.pendingShanghai)
            rejectShanghai();

        const player = session.players.find(x => x.id === event.playerId)!;
        const card = session.discard.pop()!;
        player.cards.push(card);
        player.newCards = [card];

        session.state = 'card-drawn';
        sendMessage(`${player.name} drew from the discard pile`, event);
    }

    function handleMeld() {
        if (session.currentPlayerId !== event.playerId)
            throw userError('Cannot meld on opponent\'s turn');
        if (session.state !== 'card-drawn')
            throw userError('Cannot meld right now');
        if (event.action !== 'meld')
            throw userError('Invalid action');
        if (!event.melds)
            throw userError('No melds selected');

        const player = session.players.find(x => x.id === event.playerId)!;
        if (player.melds.length !== 0)
            throw userError('You have already melded this round');

        const cards = event.melds.flatMap(x => x.cards);
        if (!cards.every(x => player.cards.some(xx => xx.id === x.id)))
            throw userError('You do not have all the needed cards');

        const config = session.config.rounds[session.round - 1];
        if (!validateMelds(event.melds, config.melds))
            throw userError('Invalid melds');

        player.melds = event.melds;
        player.cards = player.cards.filter(x => !cards.some(xx => xx.id === x.id));

        sendMessage(`${player.name} melded their cards`, event);
    }

    function handleAddMeld() {
        if (session.currentPlayerId !== event.playerId)
            throw userError('Cannot meld on opponent\'s turn');
        if (session.state !== 'card-drawn')
            throw userError('Cannot meld right now');
        if (event.action !== 'add-to-meld')
            throw userError('Invalid action');
        if (!event.meldAdd?.card)
            throw userError('Missing card');
        if (!event.meldAdd.position)
            throw userError('Missing position');

        const player = session.players.find(x => x.id === event.playerId)!;
        if (player.melds.length === 0)
            throw userError('You must meld before adding cards');

        const card = event.meldAdd.card;
        if (player.cards.findIndex(x => x.id === card.id) === -1)
            throw userError('You do not have that card');

        const owner = session.players.find(x => x.id === event.meldAdd.targetPlayerId);
        const meld = owner?.melds[event.meldAdd.meldIndex];
        if (!meld)
            throw userError('Meld was not found');

        const newMeld = { ...meld };
        switch (event.meldAdd.position) {
            case 'start':
                newMeld.cards = [card, ...meld.cards];
                break;
            case 'end':
                newMeld.cards = [...meld.cards, card];
                break;
            case 'joker': {
                if (isJoker(card))
                    throw userError('Jokers cannot replace other jokers');
                const i = findJokerSpot(card, meld);
                if (i === -1)
                    throw userError('No jokers can be replaced by this card');
                player.tempCards.push(meld.cards[i]);
                player.cards.push(meld.cards[i]);
                newMeld.cards[i] = card;
                break;
            }
            default:
                throw userError('Invalid meld position');
        }

        if (!validateMeld(newMeld.cards, meld.config))
            throw userError('Card does not fit into the meld there');

        owner.melds[event.meldAdd.meldIndex] = newMeld;
        player.cards = player.cards.filter(x => x.id !== card.id);
        player.tempCards = player.tempCards.filter(x => x.id !== card.id);
        sendMessage(`${player.name} added card ${ctool.name(card)} to ${owner.name}'s a meld`, event);

        if (player.cards.length === 0)
            endRound();
    }

    function handleDiscard() {
        if (session.currentPlayerId !== event.playerId)
            throw userError('Can\'t discard on opponent\'s turn');
        if (session.state !== 'card-drawn')
            throw userError('You must draw a card before discarding');
        if (event.action !== 'discard')
            throw userError('Invalid action');
        if (event.cards?.length !== 1)
            throw userError('Invalid amount of cards discarded');

        const card = event.cards[0];
        const player = session.players.find(x => x.id === event.playerId)!;
        const index = player.cards.findIndex(x => x.id === card.id);
        if (index === -1)
            throw userError('Cannot discard a card that you do not have');
        if (player.tempCards.length !== 0)
            throw userError('You still have temporary cards in your hand');
        player.cards.splice(index, 1);
        session.discard.push(card);
        sendMessage(`${player.name} discarded ${ctool.name(card)}`, event);

        if (player.cards.length === 0) {
            endRound();
        } else {
            startNextTurn();
        }
    }
    //#endregion

    function resetState() {
        const newSession: Session = {
            ...session,
            state: 'turn-start',
            turn: 0,
            players: session.players.map(x => resetPlayer(x)),
            currentPlayerId: session.players[0]?.id ?? '',
            deck: [],
            discard: [],
            pendingShanghai: undefined,
            winnerId: undefined
        };

        sessions[event.sessionId] = roundSetup(newSession);
        session = sessions[event.sessionId];
    }

    function roundSetup(session: Session): Session {
        const config = session.config.rounds[session.round - 1];

        // Set starting deck
        const deck = generateDeck(config.deckCount, config.jokerCount);
        session.deck = shuffle(deck);

        // Set starting player
        let currentIndex = session.round - 1;
        while (currentIndex >= session.players.length)
            currentIndex -= session.players.length;
        session.currentPlayerId = session.players[currentIndex].id;

        // Set starting cards and shouts for players
        session.players.forEach(x => {
            const cards = session.deck.splice(0, config.cardCount);
            x.cards.push(...cards);
            x.remainingShouts = config.shanghaiCount;
        });

        return session;
    }

    function resetPlayer(player: Player): Player {
        return {
            ...player,
            cards: [],
            isReady: false,
            melds: [],
            newCards: [],
            remainingShouts: 0,
            tempCards: []
        };
    }

    function reshuffleDeck() {
        session.deck = shuffle(session.discard);
        session.discard = [];
        sendMessage('Deck was re-shuffled', event);
    }

    function startGame() {
        startNextRound();
    }

    function startNextRound() {
        session.round += 1;
        resetState();
        const player = session.players.find(x => x.id === session.currentPlayerId)!;
        if (session.round === 1) {
            setTimeout(async () => {
                sendMessage('Game started! Good luck and have fun', event);
                await sleep(500);
                sendMessage(`Round ${session.round}: ${player.name} to play`, event);
            }, 1000);
        } else {
            sendMessage(`Round ${session.round} started: ${player.name} to play`, event);
        }
    }

    function startNextTurn() {
        session.state = 'turn-start';

        const time = Date.now();
        const duration = time - session.turnStartTime;
        const currentPlayer = session.players.find(x => x.id === session.currentPlayerId)!;
        currentPlayer.playtime += duration;

        const nextPlayer = getNextPlayer(session.currentPlayerId, session.players);

        session.currentPlayerId = nextPlayer.id;
        session.turn += 1;
        session.turnStartTime = time;
        console.log(`Current player: ${nextPlayer.name} - ${nextPlayer.id}`);
        sendMessage(`Turn ${session.turn} started - ${nextPlayer.name} to play`, event);
    }

    function allowShanghai(message: 'message' | 'no-message') {
        if (!session.pendingShanghai)
            throw userError('No shanghais pending');

        const player = session.players.find(x => x.id === session.pendingShanghai)!;
        player.remainingShouts -= 1;

        const card = session.discard.splice(session.discard.length - 1, 1)[0];
        player.cards.push(card);
        player.newCards = [card];

        const config = session.config.rounds[session.round - 1];
        const deckCards = session.deck.splice(0, config.shanghaiPenaltyCount);
        if (deckCards.length < config.shanghaiPenaltyCount) {
            reshuffleDeck();
            deckCards.push(...session.deck.splice(0, config.shanghaiPenaltyCount - deckCards.length));
        }

        player.cards.push(...deckCards);
        player.newCards.push(...deckCards);

        session.pendingShanghai = undefined;

        if (message === 'message')
            sendMessage(`${session.players.find(x => x.id === event.playerId)?.name} allowed shanghai`, event);
    }

    function rejectShanghai() {
        if (!session.pendingShanghai)
            throw userError('No shanghais pending');
        session.pendingShanghai = undefined;
        sendMessage('Shanghai was rejected', event);
    }

    function endRound() {
        if (session.round === session.config.rounds.length)
            return endGame();
        session.state = 'round-end';
        
        for (const player of session.players) {
            player.points += getPlayerRoundPoints(session.config, player);
        }

        sendMessage('Round has ended, press ready to continue', event);
    }

    function endGame() {
        const winner = minBy(session.players, x => x.points)!;
        session.winnerId = winner.id;
        session.state = 'game-end';

        sendMessage(`The winner is ${winner.name}!`, event);
    }
    
    //====| Helper functions |====//
    
    function currentPlayer() {
        return session.players.find(x => x.id === session.currentPlayerId)!;
    }
}