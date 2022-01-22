"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usingGameContext = void 0;
const lodash_1 = require("lodash");
const shared_1 = require("shared");
const shuffle_array_1 = __importDefault(require("shuffle-array"));
// NOTE ACE IS NOT 1
let options;
let state;
const usingGameContext = (pOptions, pState, callback) => {
    options = pOptions;
    state = pState;
    callback(handleAction, checkGameContinue, () => state);
    // Dirty trick but fast
    options = undefined;
    state = undefined;
};
exports.usingGameContext = usingGameContext;
//#region game logic
const handleAction = (action) => {
    console.log('Action');
    console.log(JSON.stringify(action, null, 2));
    if (action.playerId >= options.players.length) {
        return {
            success: false,
            error: `Player does not exist`
        };
    }
    if (!state.roundIsOn) {
        return {
            success: false,
            error: "Round hasn't started"
        };
    }
    const isPlayersTurn = action.playerId === getCurrentPlayer();
    if (!isPlayersTurn) {
        return foreignPlayerAction(action);
    }
    return currentPlayerAction(action);
};
const foreignPlayerAction = (action) => {
    if (action.shanghai) {
        return actionCallShanghai(action.playerId);
    }
    return {
        success: false,
        error: "It is not your turn"
    };
};
const currentPlayerAction = (action) => {
    if (state.shanghaiForId !== undefined) {
        return currentPlayerShanghaiAction(action);
    }
    else if (action.allowShanghai) {
        return {
            success: false,
            error: "No one has called Shanghai"
        };
    }
    if (action.shanghai) {
        return {
            success: false,
            error: "You cannot call Shanghai on your turn"
        };
    }
    const player = getGamePlayer(getCurrentPlayer());
    if (action.revealDeck) {
        return actionRevealDeck(player);
    }
    if (action.takeDiscard) {
        return actionTakeDiscard(player);
    }
    if (action.takeDeck) {
        return actionTakeDeck(player);
    }
    if (action.meld) {
        return actionMeld(player, action.meld);
    }
    if (action.discardID) {
        return actionDiscard(player, action.discardID);
    }
    if (action.addToMeld) {
        if (action.addToMeld.replaceJoker) {
            return actionAddToMeldReplaceJoker(player, action.addToMeld);
        }
        return actionAddToMeld(player, action.addToMeld);
    }
    return {
        success: false,
        error: "No valid action provided"
    };
};
// Current player when there is an active Shanghai call
const currentPlayerShanghaiAction = (action) => {
    if (action.allowShanghai) {
        return actionAllowShanghaiCall();
    }
    if (action.takeDiscard) {
        return actionTakeDiscard(getGamePlayer(getCurrentPlayer()));
    }
    return {
        success: false,
        error: "You must either allow the Shanghai call or take a card from the discard pile"
    };
};
//#region  individual actions
const actionCallShanghai = (playerId) => {
    const player = getGamePlayer(playerId);
    if (!state.shanghaiIsAllowed) {
        return {
            success: false,
            error: "Calling Shanghai is not allowed currently"
        };
    }
    if (state.discarded.length === 0) {
        return {
            success: false,
            error: "There are no cards in the discard pile"
        };
    }
    if (player.melded.length) {
        return {
            success: false,
            error: "You cannot call Shanghai after melding"
        };
    }
    if (player.shanghaiCount >= options.shanghaiCount) {
        return {
            success: false,
            error: "You have already called Shanghai maximum amount of times"
        };
    }
    if (player.id === state.discardTopOwnerId) {
        return {
            success: false,
            error: 'You cannot call Shanghai on your own discard card'
        };
    }
    if (state.shanghaiForId === undefined) {
        state.shanghaiForId = player.id;
        message(`${getPlayerName(playerId)} called Shanghai!`);
        return {
            success: true,
        };
    }
    return {
        success: false,
        error: `Shanghai was already called by ${getPlayerName(state.shanghaiForId)}`
    };
};
const actionAllowShanghaiCall = () => {
    if (state.shanghaiForId === undefined) {
        return {
            success: false,
            error: "No one has called Shanghai"
        };
    }
    const discard = state.discarded.pop();
    if (!discard) {
        return {
            success: false,
            error: "Discard pile was empty when allowing Shanghai call"
        };
    }
    const penalty = popDeck();
    const current = getGamePlayer(getCurrentPlayer());
    const player = getGamePlayer(state.shanghaiForId);
    giveCard(player, discard);
    giveCard(player, penalty);
    state.shanghaiIsAllowed = false;
    state.discardTopOwnerId = undefined;
    state.shanghaiForId = undefined;
    player.shanghaiCount++;
    message(`${getPlayerName(current.id)} allowed the Shanghai call for ${getPlayerName(player.id)} with card: ${shared_1.ctool.longName(discard)}`);
    return {
        success: true,
        message: `Succesfully allowed Shanghai for ${shared_1.ctool.longName(discard)}`
    };
};
const actionRevealDeck = (player) => {
    if (!playerCanTakeCard(player)) {
        return {
            success: false,
            error: 'You can only take 1 card per turn'
        };
    }
    if (state.discarded.length > 0 && state.deck.length > 0) {
        return {
            success: false,
            error: "Can't reveal a card if the discard pile has cards"
        };
    }
    const card = popDeck();
    state.discarded.push(card);
    state.shanghaiIsAllowed = true;
    state.discardTopOwnerId = undefined;
    message(`${getPlayerName(player.id)} revealed ${shared_1.ctool.longName(card)}`);
    return {
        success: true,
        message: `Revealed ${shared_1.ctool.longName(card)}`
    };
};
const actionTakeDiscard = (player) => {
    if (!playerCanTakeCard(player)) {
        return {
            success: false,
            error: 'You can only take 1 card per turn'
        };
    }
    const card = state.discarded.pop();
    if (!card) {
        return {
            success: false,
            error: "Can't take card from empty discard pile"
        };
    }
    if (state.shanghaiForId !== undefined && player.melded.length) {
        return {
            success: false,
            error: 'You cannot prevent a Shanghai call after melding'
        };
    }
    giveCard(player, card);
    player.canTakeCard = false;
    state.shanghaiIsAllowed = false;
    state.shanghaiForId = undefined;
    state.discardTopOwnerId = undefined;
    message(`${getPlayerName(player.id)} picked up ${shared_1.ctool.longName(card)} from the discard pile`);
    return {
        success: true,
        message: `Picked up ${shared_1.ctool.longName(card)}`,
    };
};
const actionTakeDeck = (player) => {
    if (!playerCanTakeCard(player)) {
        return {
            success: false,
            error: 'You can only take 1 card per turn'
        };
    }
    if (state.discarded.length === 0) {
        return {
            success: false,
            error: 'You must reveal the first card from the deck if the disacard pile is empty'
        };
    }
    const card = popDeck();
    giveCard(player, card);
    player.canTakeCard = false;
    state.shanghaiIsAllowed = false;
    message(`${getPlayerName(player.id)} picked up a card from the deck`);
    return {
        success: true,
        message: `Picked up ${shared_1.ctool.longName(card)}`,
    };
};
const actionMeld = (player, meld) => {
    if (player.melded.length) {
        return {
            success: false,
            error: "You have already melded your cards"
        };
    }
    const check = areMeldsValid(player, meld);
    if (!check.success) {
        return check;
    }
    const newMeld = [];
    const round = options.rounds[state.roundNumber];
    for (let i = 0; i < round.melds.length; i++) {
        // take and remove cards
        const cards = getPlayerCards(player, meld.melds[i].cardIDs, true);
        newMeld.push({ cards });
    }
    player.melded = newMeld;
    if (player.cards.length === 0) {
        endPlayerTurn(player);
    }
    message(`${getPlayerName(player.id)} melded cards`);
    return {
        success: true,
        message: "Succesfully melded cards"
    };
};
const actionDiscard = (player, toDiscardId) => {
    if (!playerCanDiscard(player)) {
        return {
            success: false,
            error: 'You must take a card before discarding'
        };
    }
    const cardToDiscard = player.cards.find(c => c.id === toDiscardId);
    if (!cardToDiscard) {
        return {
            success: false,
            error: "You do not have this card in hand"
        };
    }
    if (player.cards.some(card => card.mustBeMelded)) {
        return {
            success: false,
            error: 'You must meld the Joker cards in your hand'
        };
    }
    player.cards = player.cards.filter(c => c.id !== toDiscardId);
    state.discarded.push(cardToDiscard);
    state.discardTopOwnerId = player.id;
    endPlayerTurn(player);
    state.shanghaiIsAllowed = true;
    message(`${getPlayerName(player.id)} discarded ${shared_1.ctool.longName(cardToDiscard)}`);
    return {
        success: true,
        message: `Discarded ${shared_1.ctool.longName(cardToDiscard)}`
    };
};
const actionAddToMeld = (player, meld) => {
    const newMeldCards = isValidAddMeld(player, meld);
    if (!newMeldCards.response.success) {
        return newMeldCards.response;
    }
    if (!newMeldCards.cards) {
        return {
            success: false,
            error: 'Unknown actionAddToMeld error'
        };
    }
    // remove card from player
    const [meldedCard] = getPlayerCards(player, [meld.cardToMeldId], true);
    // save target meld
    getGamePlayer(meld.targetPlayerId).melded[meld.targetMeldIndex] = { cards: newMeldCards.cards };
    if (player.cards.length === 0) {
        endPlayerTurn(player);
    }
    message(`${getPlayerName(player.id)} melded ${shared_1.ctool.longName(meldedCard)} into ${getPlayerName(meld.targetPlayerId)}'s table`);
    return {
        success: true,
    };
};
//#endregion
// Returns the new meld cards if they are valid, undefined otherwise
const isValidAddMeld = (player, meld) => {
    // Check if player has card
    const cardToMeld = (0, lodash_1.find)(player.cards, card => card.id == meld.cardToMeldId);
    if (!cardToMeld) {
        return {
            response: {
                success: false,
                error: 'You do not have this card'
            }
        };
    }
    const targetPlayer = getGamePlayer(meld.targetPlayerId);
    if (!targetPlayer.melded.length) {
        return {
            response: {
                success: false,
                error: 'Target player has not melded yet'
            }
        };
    }
    const round = options.rounds[state.roundNumber];
    const targetMeld = round.melds[meld.targetMeldIndex];
    const targetMeldCards = [...targetPlayer.melded[meld.targetMeldIndex].cards];
    const insertIndex = meld.insertBehind ? targetMeldCards.length : 0;
    console.log("first: ", { targetMeldCards });
    targetMeldCards.splice(insertIndex, 0, cardToMeld);
    console.log({
        round, targetMeld, targetMeldCards
    });
    if (!isMeldValid(targetMeld, targetMeldCards)) {
        return {
            response: {
                success: false,
                error: 'Invalid card or position in a meld'
            }
        };
    }
    return {
        response: {
            success: true
        },
        cards: targetMeldCards
    };
};
const actionAddToMeldReplaceJoker = (player, meld) => {
    // Check if player has card
    const cardToMeld = (0, lodash_1.find)(player.cards, card => card.id == meld.cardToMeldId);
    if (!cardToMeld) {
        return {
            success: false,
            error: 'You do not have this card'
        };
    }
    const targetPlayer = getGamePlayer(meld.targetPlayerId);
    if (!targetPlayer.melded.length) {
        return {
            success: false,
            error: 'Target player has not melded yet'
        };
    }
    const targetMeld = options.rounds[state.roundNumber].melds[meld.targetMeldIndex];
    if (targetMeld.type !== 'straight') {
        return {
            success: false,
            error: 'Cannot replace Joker from a set'
        };
    }
    const targetMeldCards = targetPlayer.melded[meld.targetMeldIndex].cards;
    const jokerIndexes = (0, lodash_1.filter)(targetMeldCards, c => c.rank === 25).map((card, index) => index);
    if (!jokerIndexes.length) {
        return {
            success: false,
            error: 'There are not any jokers to replace'
        };
    }
    const roundMeld = options.rounds[state.roundNumber].melds[meld.targetMeldIndex];
    for (const jokerIndex of jokerIndexes) {
        const jokerReplace = tryReplaceJoker(cardToMeld, targetMeldCards, roundMeld, jokerIndex);
        if (jokerReplace) {
            // Remove card to meld
            getPlayerCards(player, [cardToMeld.id], true);
            // Replace joker
            targetPlayer.melded[meld.targetMeldIndex] = { cards: jokerReplace.newMeldCards };
            // Give new joker
            giveCard(player, Object.assign(Object.assign({}, jokerReplace.jokerCard), { mustBeMelded: true }));
            message(`${getPlayerName(player.id)} replaced the Joker from ${getPlayerName(meld.targetPlayerId)}'s table with card ${shared_1.ctool.longName(cardToMeld)}`);
            return {
                success: true,
                message: 'Succesfully replaced Joker'
            };
        }
    }
    return {
        success: false,
        error: `The card ${shared_1.ctool.longName(cardToMeld)} cannot replace any Jokers`
    };
};
const tryReplaceJoker = (cardToMeld, targetMeldCards, meld, joker) => {
    const newMeldCards = [...targetMeldCards];
    const jokerCard = newMeldCards[joker];
    newMeldCards[joker] = cardToMeld;
    if (checkStraightValidity(newMeldCards, meld.length)) {
        return {
            newMeldCards,
            jokerCard
        };
    }
};
// NOTE!!! REQUIREMENTS FOR ALL STRAIGHTS MUST HAVE EQUAL LENGTH AND ALL SETS MUST BE OF EQUAL SIZE
const areMeldsValid = (player, playerMelds) => {
    if (hasDuplicateMeldCards(playerMelds)) {
        console.log("duplicate meld cards");
        return {
            success: false,
            error: 'You tried to meld duplicate cards'
        };
    }
    const round = options.rounds[state.roundNumber];
    if (playerMelds.melds.length !== round.melds.length) {
        console.log("Invalid meld array count");
        return {
            success: false,
            error: 'Invalid amount of melds'
        };
    }
    for (let i = 0; i < round.melds.length; i++) {
        const meld = round.melds[i];
        const playerMeld = playerMelds.melds[i];
        if (!isPlayerMeldValid(player, meld, playerMeld)) {
            return {
                success: false,
                error: 'Invalid meld'
            };
        }
    }
    return {
        success: true
    };
};
const hasDuplicateMeldCards = (melds) => {
    const cardIDs = (0, lodash_1.flatMap)(melds.melds, m => m.cardIDs);
    return cardIDs.length !== (0, lodash_1.uniq)(cardIDs).length;
};
const isPlayerMeldValid = (player, meld, playerMeld) => {
    const cards = getPlayerCards(player, playerMeld.cardIDs, false);
    // Tried to meld cards we don't have
    if (cards.length !== playerMeld.cardIDs.length) {
        console.log("melding unavailable cards");
        return false;
    }
    return isMeldValid(meld, cards);
};
const isMeldValid = (meld, cards) => {
    if (meld.type === "set") {
        return checkSetValidity(cards, meld.length);
    }
    if (meld.type === "straight") {
        return checkStraightValidity(cards, meld.length);
    }
    throw "Invalid meld type";
};
// Input is ordered by meld order
const checkSetValidity = (cards, size) => {
    if (cards.length < size) {
        return false;
    }
    const refCard = (0, lodash_1.minBy)(cards, c => c.rank);
    // No cards
    if (!refCard) {
        console.log('Set error: no cards');
        return false;
    }
    // All jokers
    if (refCard.rank === 25) {
        console.log('Set success: all jokers');
        return true;
    }
    // Many different ranks
    if (cards.some(card => card.rank !== 25 && card.rank !== refCard.rank)) {
        console.log('Set error: many different ranks');
        return false;
    }
    console.log(`return ${cards.length} >= ${size}`);
    return true;
};
// Input is ordered by meld order
const checkStraightValidity = (cards, length) => {
    if (cards.length < length) {
        return false;
    }
    const refCard = (0, lodash_1.minBy)(cards, c => c.rank);
    // No cards
    if (!refCard) {
        console.log("no cards");
        return false;
    }
    // All jokers (if minimum rank is joker)
    if (refCard.rank === 25) {
        return true;
    }
    // not same suit (card is not joker and different suit)
    if (cards.some(card => card.rank !== 25 && card.suit !== refCard.suit)) {
        return false;
    }
    const firstRank = getFirstExpectedRank(cards);
    // straight starts from below ace
    if (firstRank === undefined) {
        return false;
    }
    let expectedRank;
    if (firstRank === 14) {
        expectedRank = 2;
    }
    else {
        expectedRank = shared_1.ctool.nextRank(firstRank);
    }
    for (let i = 1; i < cards.length; i++) {
        // straight cannot continue after ace
        if (!expectedRank) {
            return false;
        }
        const rank = cards[i].rank;
        // not joker and not expected rank
        if (rank !== 25 && rank !== expectedRank) {
            return false;
        }
        expectedRank = shared_1.ctool.nextRank(expectedRank);
    }
    return true;
};
const getFirstExpectedRank = (cards) => {
    let firstRank = cards[0].rank;
    // starts with joker
    if (firstRank === 25) {
        const firstNonJokerIndex = (0, lodash_1.findIndex)(cards, card => card.rank !== 25);
        const firstNonJokerRank = cards[firstNonJokerIndex].rank;
        // first card is first non joker - firstJokerCount
        const firstRankValue = firstNonJokerRank - firstNonJokerIndex;
        // straight starts from below ace
        if (firstRankValue < 1) {
            return undefined;
        }
        // straight starts from ace
        if (firstRankValue === 1) {
            firstRank = 14;
        }
        else {
            firstRank = firstRankValue;
        }
    }
    return firstRank;
};
const playerCanTakeCard = (player) => {
    return player.canTakeCard;
};
const playerCanDiscard = (player) => {
    return !player.canTakeCard;
};
const getPlayerTargetCardCount = (player) => {
    return options.rounds[state.roundNumber].cardCount + player.shanghaiCount * 2;
};
const endPlayerTurn = (player) => {
    if (player.cards.length === 0 || state.deck.length === 0) {
        state.roundIsOn = false;
        state.discarded = [];
        state.shanghaiForId = undefined;
        state.message = 'Round ended';
        addPlayerPoints();
        unreadyPlayers();
        /// last round just ended
        if (state.roundNumber === options.rounds.length - 1) {
            const winner = (0, lodash_1.minBy)(state.players, p => p.points);
            state.winnerId = winner ? winner.id : -1;
            return;
        }
    }
    state.turn++;
    enablePlayerTurn();
};
const enablePlayerTurn = () => {
    state.players.forEach(p => p.canTakeCard = false);
    const player = getGamePlayer(getCurrentPlayer());
    player.canTakeCard = true;
    player.actionRelatedCardID = undefined;
};
const addPlayerPoints = () => {
    state.players.forEach(player => {
        player.cards.forEach(card => {
            player.points += card.rank;
        });
    });
};
const unreadyPlayers = () => {
    options.players.forEach(player => player.isReady = false);
};
const checkGameContinue = () => {
    if (state.roundIsOn) {
        return;
    }
    if ((0, lodash_1.some)(options.players, p => !p.isReady)) {
        return;
    }
    // all ready
    state.roundNumber++;
    initializeRound();
};
const initializeRound = () => {
    state.roundIsOn = true;
    const round = options.rounds[state.roundNumber];
    state.players.forEach(resetPlayer);
    state.deck = shuffle(createDeck(round.deckCount, round.jokerCount));
    state.discarded = [];
    state.shanghaiForId = undefined;
    // deal
    for (let p = 0; p < state.players.length; p++) {
        const player = state.players[p];
        for (let i = 0; i < round.cardCount; i++) {
            giveCard(player, popDeck());
        }
    }
    state.turn = state.roundNumber % state.players.length;
    enablePlayerTurn();
};
const resetPlayer = (player) => {
    player.cards = [];
    player.shanghaiCount = 0;
    player.melded = [];
    player.canTakeCard = false;
};
//#endregion
const getPlayer = (id) => options.players[id];
const getGamePlayer = (id) => state.players[id];
const getPlayerName = (id) => getPlayer(id).name;
const getCurrentPlayer = () => options.players[(0, shared_1.getPlayerTurn)(state, state.turn)].id;
const getPlayerCards = (player, cardIDs, removeCards) => {
    const cardsToTake = (0, lodash_1.compact)(cardIDs.map(id => (0, lodash_1.find)(player.cards, c => c.id === id)));
    if (removeCards) {
        console.log("removing cards...", { player, cardsToTake });
        player.actionRelatedCardID = undefined;
        player.cards = (0, lodash_1.filter)(player.cards, card => !cardsToTake.includes(card));
        console.log(player);
    }
    return cardsToTake;
};
const popDeck = () => {
    if (state.deck.length === 0) {
        state.deck = shuffle(state.discarded);
        state.discarded = [];
    }
    const card = state.deck[0];
    state.deck = state.deck.slice(1);
    return card;
};
const giveCard = (player, card) => {
    player.cards.push(card);
    player.cards = (0, lodash_1.orderBy)(player.cards, shared_1.cardOrderIndex);
    player.actionRelatedCardID = card.id;
};
const shuffle = (cards) => {
    return (0, shuffle_array_1.default)(cards);
};
const message = (msg) => state.message = msg;
const createDeck = (deckCount, jokerCount) => {
    if (deckCount > 8)
        throw new Error("Cannot have more than 8 decks");
    if (jokerCount > 4 * deckCount)
        throw new Error("Cannot have more than 4*decks of jokers");
    const cards = [];
    for (let suit = 0; suit < 4; suit++) {
        for (let rank = 2; rank <= 14; rank++) {
            for (let deck = 0; deck < deckCount; deck++) {
                cards.push(shared_1.ctool.fromValues(rank, suit, deck));
            }
        }
    }
    for (let i = 0; i < jokerCount; i++) {
        cards.push(shared_1.ctool.fromValues(25, i % 4, (0, lodash_1.floor)(i / 4)));
    }
    return cards;
};
