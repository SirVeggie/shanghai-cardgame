"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAction = exports.startGame = exports.getState = exports.getGame = void 0;
const lodash_1 = require("lodash");
const shared_1 = require("../../frontend/src/shared");
const shuffle_array_1 = __importDefault(require("shuffle-array"));
// NOTE ACE IS NOT 1
let options;
let state;
const getGame = () => options;
exports.getGame = getGame;
const getState = () => state;
exports.getState = getState;
const startGame = (game) => {
    options = game.options;
    state = game.state ? game.state : initialState(options.players);
};
exports.startGame = startGame;
//#region game logic
const handleAction = (action) => {
    console.log('Action');
    console.log(JSON.stringify(action, null, 2));
    if (!(0, lodash_1.some)(options.players, n => n === action.playerName)) {
        return {
            success: false,
            error: `Player ${action.playerName} is not in the game`
        };
    }
    if (action.setReady) {
        const player = (0, shared_1.getPlayerByName)(state, action.playerName);
        player.isReady = true;
        checkGameContinue();
        return {
            success: true
        };
    }
    if (!state.roundIsOn) {
        return {
            success: false,
            error: "Round hasn't started"
        };
    }
    const isPlayersTurn = action.playerName === (0, shared_1.getCurrentPlayer)(state).name;
    if (!isPlayersTurn) {
        return foreignPlayerAction(action);
    }
    return currentPlayerAction(action);
};
exports.handleAction = handleAction;
const foreignPlayerAction = (action) => {
    if (action.shanghai) {
        return actionCallShanghai(action.playerName);
    }
    return {
        success: false,
        error: "It is not your turn"
    };
};
const currentPlayerAction = (action) => {
    if (state.shanghaiFor) {
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
    const player = (0, shared_1.getCurrentPlayer)(state);
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
        if (action.addToMeld.targetMeldInsertIndex !== undefined) {
            return actionAddToMeld(player, action.addToMeld);
        }
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
        return actionTakeDiscard((0, shared_1.getCurrentPlayer)(state));
    }
    return {
        success: false,
        error: "You must either allow the Shanghai call or take a card from the discard pile"
    };
};
//#region  individual actions
const actionCallShanghai = (playerName) => {
    const player = (0, shared_1.getPlayerByName)(state, playerName);
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
    if (!state.shanghaiFor) {
        state.shanghaiFor = player.name;
        message(`${player.name} called Shanghai!`);
        return {
            success: true,
        };
    }
    return {
        success: false,
        error: `Shanghai was already called by ${state.shanghaiFor}`
    };
};
const actionAllowShanghaiCall = () => {
    if (!state.shanghaiFor) {
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
    const current = (0, shared_1.getCurrentPlayer)(state);
    const player = (0, shared_1.getPlayerByName)(state, state.shanghaiFor);
    giveCard(player, discard);
    giveCard(player, penalty);
    state.shanghaiIsAllowed = false;
    state.shanghaiFor = null;
    player.shanghaiCount++;
    message(`${current.name} allowed the Shanghai call for ${player.name} with card: ${(0, shared_1.cardToString)(discard)}`);
    return {
        success: true,
        message: `Succesfully allowed Shanghai for ${(0, shared_1.cardToString)(discard)}`
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
    message(`${player.name} revealed ${(0, shared_1.cardToString)(card)}`);
    return {
        success: true,
        message: `Revealed ${(0, shared_1.cardToString)(card)}`
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
    giveCard(player, card);
    player.canTakeCard = false;
    state.shanghaiIsAllowed = false;
    state.shanghaiFor = null;
    message(`${player.name} picked up ${(0, shared_1.cardToString)(card)} from the discard pile`);
    return {
        success: true,
        message: `Picked up ${(0, shared_1.cardToString)(card)}`
    };
};
const actionTakeDeck = (player) => {
    if (!playerCanTakeCard(player)) {
        return {
            success: false,
            error: 'You can only take 1 card per turn'
        };
    }
    const card = popDeck();
    giveCard(player, card);
    player.canTakeCard = false;
    state.shanghaiIsAllowed = false;
    message(`${player.name} picked up a card from the deck`);
    return {
        success: true,
        message: `Picked up ${(0, shared_1.cardToString)(card)}`
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
    message(`${player.name} melded cards`);
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
    endPlayerTurn(player);
    state.shanghaiIsAllowed = true;
    message(`${player.name} discarded ${(0, shared_1.cardToString)(cardToDiscard)}`);
    return {
        success: true,
        message: `Discarded ${(0, shared_1.cardToString)(cardToDiscard)}`
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
    (0, shared_1.getPlayerByName)(state, meld.targetPlayer).melded[meld.targetMeldIndex] = { cards: newMeldCards.cards };
    if (player.cards.length === 0) {
        endPlayerTurn(player);
    }
    message(`${player.name} melded ${(0, shared_1.cardToString)(meldedCard)} into ${meld.targetPlayer}'s table`);
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
    const targetPlayer = (0, shared_1.getPlayerByName)(state, meld.targetPlayer);
    if (!targetPlayer.melded.length) {
        return {
            response: {
                success: false,
                error: 'Target player has not melded yet'
            }
        };
    }
    if (meld.targetMeldInsertIndex === undefined) {
        return {
            response: {
                success: false,
                error: 'No action was provided'
            }
        };
    }
    const round = options.rounds[state.roundNumber];
    const targetMeld = round.melds[meld.targetMeldIndex];
    const targetMeldCards = [...targetPlayer.melded[meld.targetMeldIndex].cards];
    console.log("first: ", { targetMeldCards });
    targetMeldCards.splice(meld.targetMeldInsertIndex, 0, cardToMeld);
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
    const targetPlayer = (0, shared_1.getPlayerByName)(state, meld.targetPlayer);
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
    const jokers = getStraightJokersFromValidStraight(targetMeldCards);
    const matchingJoker = jokers.find(joker => joker.rank === cardToMeld.rank);
    if (!matchingJoker) {
        return {
            success: false,
            error: 'You cannot replace any jokers with this card'
        };
    }
    const newCards = [...targetMeldCards];
    // Remove card to meld
    getPlayerCards(player, [cardToMeld.id], true);
    // replace joker
    newCards[matchingJoker.index] = cardToMeld;
    // save new meld
    targetPlayer.melded[meld.targetMeldIndex] = { cards: newCards };
    // Give new joker
    giveCard(player, Object.assign(Object.assign({}, matchingJoker.joker), { mustBeMelded: true }));
    message(`${player.name} replaced the Joker from ${meld.targetPlayer}'s table with card ${(0, shared_1.cardToString)(cardToMeld)}`);
    return {
        success: true,
        message: 'Succesfully replaced Joker'
    };
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
    // not same suit
    if (cards.some(card => card.suit !== refCard.suit)) {
        return false;
    }
    // All jokers (if minimum rank is joker)
    if (refCard.rank === 25) {
        return true;
    }
    // corner case when joker is below 1
    if (cards.length > 2) {
        // joker followed by ace
        if (cards[0].rank === 25 && cards[1].rank === 14) {
        }
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
        expectedRank = (0, shared_1.nextRank)(firstRank);
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
        expectedRank = (0, shared_1.nextRank)(expectedRank);
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
const getStraightJokersFromValidStraight = (cards) => {
    const jokers = [];
    let expectedRank = getFirstExpectedRank(cards);
    // melded straights should be valid
    if (!expectedRank) {
        throw "Melded straight was invalid check 1";
    }
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (!expectedRank) {
            throw "Melded straight was invalid check 2";
        }
        if (card.rank === 25) {
            jokers.push({
                joker: card,
                index: i,
                rank: expectedRank
            });
        }
        expectedRank = (0, shared_1.nextRank)(expectedRank);
    }
    return jokers;
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
        addPlayerPoints();
        unreadyPlayers();
        /// last round just ended
        if (state.roundNumber === options.rounds.length - 1) {
            const winner = (0, lodash_1.minBy)(state.players, p => p.points);
            state.winner = winner ? winner.name : "No winner";
            return;
        }
    }
    state.turn++;
    enablePlayerTurn();
};
const enablePlayerTurn = () => {
    state.players.forEach(p => p.canTakeCard = false);
    const player = (0, shared_1.getCurrentPlayer)(state);
    player.canTakeCard = true;
};
const addPlayerPoints = () => {
    state.players.forEach(player => {
        player.cards.forEach(card => {
            player.points += card.rank;
        });
    });
};
const unreadyPlayers = () => {
    state.players.forEach(player => player.isReady = false);
};
const checkGameContinue = () => {
    if (state.roundIsOn) {
        return;
    }
    if ((0, lodash_1.some)(state.players, p => !p.isReady)) {
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
    state.deck = shuffle(createDeck(options.deckCount, options.jokerCount));
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
const getPlayerCards = (player, cardIDs, removeCards) => {
    const cardsToTake = (0, lodash_1.compact)(cardIDs.map(id => (0, lodash_1.find)(player.cards, c => c.id === id)));
    if (removeCards) {
        console.log("removing cards...", { player, cardsToTake });
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
    player.cards = (0, lodash_1.orderBy)(player.cards, c => c.id);
};
const shuffle = (cards) => {
    return (0, shuffle_array_1.default)(cards);
};
const message = (msg) => state.message = msg;
const initialState = (players) => {
    return {
        players: players.map(createPlayer),
        roundIsOn: false,
        roundNumber: -1,
        turn: 0,
        shanghaiIsAllowed: false,
        shanghaiFor: null,
        deck: createDeck(options.deckCount, options.jokerCount),
        discarded: [],
    };
};
const createDeck = (deckCount, jokerCount) => {
    let cardId = 1;
    const cards = [];
    for (let deck = 0; deck < deckCount; deck++) {
        for (let suit = 0; suit < 4; suit++) {
            for (let rank = 2; rank <= 14; rank++) {
                cards.push({
                    id: cardId++,
                    suit: (0, shared_1.suitFromNumber)(suit),
                    rank: rank
                });
            }
        }
    }
    for (let i = 0; i < jokerCount; i++) {
        cards.push({
            id: cardId++,
            suit: (0, shared_1.suitFromNumber)(i),
            rank: 25
        });
    }
    return cards;
};
const createPlayer = (name) => ({
    name,
    isReady: false,
    points: 0,
    cards: [],
    melded: [],
    shanghaiCount: 0,
    canTakeCard: false
});
