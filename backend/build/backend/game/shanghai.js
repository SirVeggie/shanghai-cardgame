"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAction = exports.startGame = exports.getState = exports.getGame = void 0;
const lodash_1 = require("lodash");
const shared_1 = require("../../frontend/src/shared");
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
    if (!(0, lodash_1.some)(options.players, n => n === action.playerName)) {
        return {
            success: false,
            error: `Player ${action.playerName} is not in the game`
        };
    }
    if (action.setReady) {
        const player = getPlayerByName(action.playerName);
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
    const isPlayersTurn = action.playerName === getCurrentPlayer().name;
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
    if (action.revealDeck) {
        return actionRevealDeck();
    }
    const player = getCurrentPlayer();
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
        return actionTakeDiscard(getCurrentPlayer());
    }
    return {
        success: false,
        error: "You must either allow the Shanghai call or take a card from the discard pile"
    };
};
//#region  individual actions
const actionCallShanghai = (playerName) => {
    const player = getPlayerByName(playerName);
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
    const player = getPlayerByName(state.shanghaiFor);
    giveCard(player, discard);
    giveCard(player, penalty);
    state.shanghaiIsAllowed = false;
    return {
        success: true,
        message: `Succesfully called Shanghai for ${(0, shared_1.cardToString)(discard)} and received ${(0, shared_1.cardToString)(penalty)} as penalty`
    };
};
const actionRevealDeck = () => {
    if (state.discarded.length > 0 && state.deck.length > 0) {
        return {
            success: false,
            error: "Can't reveal a card if the discard pile has cards"
        };
    }
    const card = popDeck();
    state.discarded.push(card);
    return {
        success: true,
        message: `Revealed ${(0, shared_1.cardToString)(card)}`
    };
};
const actionTakeDiscard = (player) => {
    const card = state.discarded.pop();
    if (!card) {
        return {
            success: false,
            error: "Can't take card from empty discard pile"
        };
    }
    giveCard(player, card);
    state.shanghaiIsAllowed = false;
    return {
        success: true,
        message: `Picked up ${(0, shared_1.cardToString)(card)}`
    };
};
const actionTakeDeck = (player) => {
    const card = popDeck();
    giveCard(player, card);
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
    if (!areMeldsValid(player, meld)) {
        return {
            success: false,
            error: "Invalid meld"
        };
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
    return {
        success: true,
        message: "Succesfully melded cards"
    };
};
const actionDiscard = (player, toDiscardId) => {
    const cardToDiscard = player.cards.find(c => c.id === toDiscardId);
    if (!cardToDiscard) {
        return {
            success: false,
            error: "You do not have this card in hand"
        };
    }
    player.cards = player.cards.filter(c => c.id !== toDiscardId);
    state.discarded.push(cardToDiscard);
    endPlayerTurn(player);
    state.shanghaiIsAllowed = true;
    return {
        success: true,
        message: `Discarded ${(0, shared_1.cardToString)(cardToDiscard)}`
    };
};
const actionAddToMeld = (player, meld) => {
    const newMeldCards = isValidAddMeld(player, meld);
    if (!newMeldCards) {
        return {
            success: false,
            error: "Invalid meld action"
        };
    }
    // remove card from player
    getPlayerCards(player, [meld.cardToMeldId], true);
    // save target meld
    getPlayerByName(meld.targetPlayer).melded[meld.targetMeldIndex] = { cards: newMeldCards };
    if (player.cards.length === 0) {
        endPlayerTurn(player);
    }
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
        return undefined;
    }
    const targetPlayer = getPlayerByName(meld.targetPlayer);
    if (!targetPlayer.melded.length) {
        return undefined;
    }
    const round = options.rounds[state.roundNumber];
    const targetMeld = round.melds[meld.targetMeldIndex];
    let targetMeldCards = targetPlayer.melded[meld.targetMeldIndex].cards;
    targetMeldCards = targetMeldCards.splice(meld.targetMeldInsertIndex, 0, cardToMeld);
    if (!isMeldValid(targetMeld, targetMeldCards)) {
        return undefined;
    }
    return targetMeldCards;
};
// NOTE!!! REQUIREMENTS FOR ALL STRAIGHTS MUST HAVE EQUAL LENGTH AND ALL SETS MUST BE OF EQUAL SIZE
const areMeldsValid = (player, playerMelds) => {
    if (hasDuplicateMeldCards(playerMelds)) {
        console.log("duplicate meld cards");
        return false;
    }
    const round = options.rounds[state.roundNumber];
    if (playerMelds.melds.length !== round.melds.length) {
        console.log("Invalid meld array count");
        return false;
    }
    for (let i = 0; i < round.melds.length; i++) {
        const meld = round.melds[i];
        const playerMeld = playerMelds.melds[i];
        if (!isPlayerMeldValid(player, meld, playerMeld)) {
            return false;
        }
    }
    return true;
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
    const refCard = (0, lodash_1.minBy)(cards, c => c.rank);
    // No cards
    if (!refCard) {
        return false;
    }
    // All jokers
    if (refCard.rank === 25 && cards.length >= size) {
        return true;
    }
    // Many different ranks
    if (cards.some(card => card.rank !== 25 && card.rank !== refCard.rank)) {
        return false;
    }
    return cards.length >= size;
};
// Input is ordered by meld order
const checkStraightValidity = (cards, length) => {
    const refCard = (0, lodash_1.minBy)(cards, c => c.rank);
    // No cards
    if (!refCard) {
        console.log("no cards");
        return false;
    }
    // All jokers
    if (refCard.rank === 25 && cards.length >= length) {
        return true;
    }
    const ordered = (0, lodash_1.orderBy)(cards, c => c.id);
    let expectedRank = refCard.rank;
    for (let card of ordered) {
        // Straight did not end at an Ace
        if (!expectedRank) {
            console.log("unexpected rank");
            return false;
        }
        // Card is not joker and card is not the next expected rank
        // or suit is wrong
        if (card.rank !== 25 && card.rank !== expectedRank && card.suit !== refCard.suit) {
            console.log("unexpected suit");
            return false;
        }
        expectedRank = (0, shared_1.nextRank)(expectedRank);
    }
    return ordered.length >= length;
};
const endPlayerTurn = (player) => {
    if (player.cards.length === 0) {
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
};
const resetPlayer = (player) => {
    player.cards = [];
    player.shanghaiCount = 0;
    player.melded = [];
};
//#endregion
const getCurrentPlayer = () => state.players[getPlayerTurn(state.turn)];
const getPlayerByName = (name) => state.players.filter(p => p.name === name)[0];
const getPlayerTurn = (turnIndex) => turnIndex % state.players.length;
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
    // for testing
    return cards;
    const array = [...cards];
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
};
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
});
