import { minBy } from 'lodash';
import { ctool, findJokerSpot, GameEvent, generateDeck, getNextPlayer, getPrevPlayer, isJoker, Player, Session, shuffle, validateMeld, validateMelds } from 'shared';
import { WebSocket } from 'ws';
import { sendError, sendMessage } from '../networking/socket';
import { updateClients } from './controller';

export function eventHandler(sessions: Record<string, Session>, event: GameEvent, ws: WebSocket) {
    if (!sessions[event.sessionId])
        return sendError(ws, 'Invalid session');
    const session = sessions[event.sessionId];

    handle();
    updateClients(sessions, event);

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

            default: return sendError(ws, 'Event was not handled properly');
        }
    }

    //#region handlers
    function handleConnect() {
        const player = session.players.find(x => x.id === event.playerId);
        if (!player)
            return sendError(ws, 'Invalid player id');
        sendMessage(`Player ${player.name} rejoined`, event);
    }

    function handleDisconnect() {
        const player = session.players.find(x => x.id === event.playerId);
        if (!player)
            return sendError(ws, 'Invalid player id');
        sendMessage(`Player ${player.name} disconnected`, event);
    }



    function handleSetReady() {
        if (session.state !== 'waiting-players' && session.state !== 'round-end')
            return sendError(ws, 'Cannot set ready state right now');

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
            return sendError(ws, 'Cannot reveal card, discard pile not empty');
        if (session.state !== 'turn-start' && session.state !== 'shanghai-called')
            return sendError(ws, 'Cannot reveal a card right now');
        if (session.currentPlayerId !== event.playerId)
            return sendError(ws, 'Cannot reveal on someone else\'s turn');

        // Reset shanghai when new card revealed
        session.state = 'turn-start';
        const card = session.deck.splice(0, 1)[0];
        session.discard.push(card);
    }

    function handleCallShanghai() {
        if (session.pendingShanghai)
            return sendError(ws, `Player ${session.players.find(x => x.id === session.pendingShanghai)} already called shanghai`);
        if (session.state !== 'turn-start')
            return sendError(ws, 'Shanghai is not allowed right now');
        if (event.playerId === session.currentPlayerId)
            return sendError(ws, 'Current player cannot call shanghai');
        if (event.playerId === getPrevPlayer(session.currentPlayerId, session.players).id)
            return sendError(ws, 'Can\'t call shanghai on a card you discarded');
        if (session.discard.length === 0)
            return sendError(ws, 'Discard pile empty, can\'t call shanghai');

        const p = session.players.find(x => x.id === event.playerId)!;
        if (p.melds.length)
            return sendError(ws, 'You cannot call shanghai after melding');
        if (p.remainingShouts <= 0)
            return sendError(ws, 'No more shanghais remaining');

        session.pendingShanghai = event.playerId;
        session.state = 'shanghai-called';

        const current = session.players.find(x => x.id === session.currentPlayerId)!;
        if (current.melds.length !== 0) {
            allowShanghai('no-message');
        }

        sendMessage(`Player ${p.name} called shanghai!`, event, true);
    }

    function handleDrawDeck() {
        if (session.currentPlayerId !== event.playerId)
            return sendError(ws, 'Cannot draw on opponent\'s turn');
        if (session.state !== 'turn-start' && session.state !== 'shanghai-called')
            return sendError(ws, 'Cannot draw a card right now');

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

        session.state = 'card-drawn';
        sendMessage(`Player ${player.name} drew a card from the deck`, event);
    }

    function handleDrawDiscard() {
        if (session.currentPlayerId !== event.playerId)
            return sendError(ws, 'Cannot draw on opponent\'s turn');
        if (session.state !== 'turn-start' && session.state !== 'shanghai-called')
            return sendError(ws, 'Cannot draw from the discard pile right now');
        if (session.discard.length === 0 && session.deck.length === 0) {
            sendError(ws, 'Deck and discard pile are empty, card drawing skipped');
            return session.state = 'card-drawn';
        }

        if (session.discard.length === 0)
            return sendError(ws, 'Discard pile is empty');

        if (session.pendingShanghai)
            rejectShanghai();

        const player = session.players.find(x => x.id === event.playerId)!;
        const card = session.discard.pop()!;
        player.cards.push(card);

        session.state = 'card-drawn';
        sendMessage(`Player ${player.name} drew from the discard pile`, event);
    }

    function handleMeld() {
        if (session.currentPlayerId !== event.playerId)
            return sendError(ws, 'Cannot meld on opponent\'s turn');
        if (session.state !== 'card-drawn')
            return sendError(ws, 'Cannot meld right now');
        if (event.action !== 'meld')
            return sendError(ws, 'Invalid action');
        if (!event.melds)
            return sendError(ws, 'No melds selected');

        const player = session.players.find(x => x.id === event.playerId)!;
        if (player.melds.length !== 0)
            return sendError(ws, 'You have already melded this round');

        const cards = event.melds.flatMap(x => x.cards);
        if (!cards.every(x => player.cards.some(xx => xx.id === x.id)))
            return sendError(ws, 'You do not have all the needed cards');

        const config = session.config.rounds[session.round - 1];
        if (!validateMelds(event.melds, config.melds))
            return sendError(ws, 'Invalid melds');

        player.melds = event.melds;
        player.cards = player.cards.filter(x => !cards.some(xx => xx.id === x.id));

        sendMessage(`Player ${player.name} melded their cards`, event);
    }

    function handleAddMeld() {
        if (session.currentPlayerId !== event.playerId)
            return sendError(ws, 'Cannot meld on opponent\'s turn');
        if (session.state !== 'card-drawn')
            return sendError(ws, 'Cannot meld right now');
        if (event.action !== 'add-to-meld')
            return sendError(ws, 'Invalid action');
        if (!event.meldAdd?.card)
            return sendError(ws, 'Missing card');
        if (!event.meldAdd.position)
            return sendError(ws, 'Missing position');

        const player = session.players.find(x => x.id === event.playerId)!;
        if (player.melds.length === 0)
            return sendError(ws, 'You must meld before adding cards');

        const card = event.meldAdd.card;
        if (player.cards.findIndex(x => x.id === card.id) === -1)
            return sendError(ws, 'You do not have that card');

        const owner = session.players.find(x => x.id === event.meldAdd.targetPlayerId);
        const meld = owner?.melds[event.meldAdd.meldIndex];
        if (!meld)
            return sendError(ws, 'Meld was not found');

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
                    return sendError(ws, 'Jokers cannot replace other jokers');
                const i = findJokerSpot(card, meld);
                if (i === -1)
                    return sendError(ws, 'No jokers can be replaced by this card');
                newMeld.cards[i] = card;
                break;
            }
            default:
                return sendError(ws, 'Invalid meld position');
        }

        if (!validateMeld(newMeld.cards, meld.config))
            return sendError(ws, 'Card does not fit into the meld there');

        owner.melds[event.meldAdd.meldIndex] = newMeld;
        player.cards = player.cards.filter(x => x.id === card.id);
        sendMessage(`Player ${player.name} added card ${ctool.name(card)} to a meld`, event);

        if (player.cards.length === 0)
            endRound();
    }

    function handleDiscard() {
        if (session.currentPlayerId !== event.playerId)
            return sendError(ws, 'Can\'t discard on opponent\'s turn');
        if (session.state !== 'card-drawn')
            return sendError(ws, 'You must draw a card before discarding');
        if (event.action !== 'discard')
            return sendError(ws, 'Invalid action');
        if (event.cards?.length !== 1)
            return sendError(ws, 'Invalid amount of cards discarded');

        const card = event.cards[0];
        const player = session.players.find(x => x.id === event.playerId)!;
        const index = player.cards.findIndex(x => x.id === card.id);
        if (index === -1)
            return sendError(ws, 'Cannot discard a card that you do not have');
        if (player.cards.some(x => player.tempCards.some(xx => xx.id === x.id)))
            return sendError(ws, 'You still have temporary cards in your hand');
        player.cards.splice(index, 1);
        session.discard.push(card);

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
        sendMessage('Deck was re-shuffled', event, true);
    }

    function startGame() {
        startNextRound();
    }

    function startNextRound() {
        session.round += 1;
        resetState();
    }

    function startNextTurn() {
        session.state = 'turn-start';
        const nextPlayer = getNextPlayer(session.currentPlayerId, session.players);
        session.currentPlayerId = nextPlayer.id;
        session.turn += 1;
    }

    function allowShanghai(message: 'message' | 'no-message') {
        if (!session.pendingShanghai)
            return sendError(ws, 'No shanghais pending');

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
            sendMessage(`Player ${session.players.find(x => x.id === event.playerId)?.name} allowed shanghai`, event);
    }

    function rejectShanghai() {
        if (!session.pendingShanghai)
            return sendError(ws, 'No shanghais pending');
        session.pendingShanghai = undefined;
        sendMessage('Shanghai was rejected', event, true);
    }

    function endRound() {
        if (session.round === session.config.rounds.length)
            return endGame();
        session.state = 'round-end';

        sendMessage('Round has ended, press ready to continue', event, true);
    }

    function endGame() {
        const winner = minBy(session.players, x => x.points)!;
        session.winnerId = winner.id;
        session.state = 'game-end';

        sendMessage(`The winner is ${winner.name}!`, event, true);
    }
}