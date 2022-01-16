"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerTurn = exports.getPlayerByName = exports.getCurrentPlayer = exports.nextRank = exports.suitToString = exports.rankToString = exports.cardToString = exports.suitFromNumber = void 0;
const suitFromNumber = (n) => {
    const v = n % 4;
    switch (v) {
        case 0:
            return "heart";
        case 1:
            return "spade";
        case 2:
            return "diamond";
        default:
            return "club";
    }
};
exports.suitFromNumber = suitFromNumber;
const cardToString = (card) => `${(0, exports.rankToString)(card.rank)} of ${card.suit}s`;
exports.cardToString = cardToString;
const rankToString = (rank) => {
    switch (rank) {
        case 11:
            return "Jack";
        case 12:
            return "Queen";
        case 13:
            return "King";
        case 14:
            return "Ace";
        case 25:
            return "Joker";
        default:
            return `${rank}`;
    }
};
exports.rankToString = rankToString;
const suitToString = (rank) => {
    switch (rank) {
        case 'heart':
            return '♥';
        case 'diamond':
            return '♦';
        case 'spade':
            return '♠';
        default:
            return '♣';
    }
};
exports.suitToString = suitToString;
const nextRank = (rank, loop = false) => {
    let rankAdd = rank + 1;
    if (rankAdd > 14) {
        return loop ? 2 : undefined;
    }
    return rankAdd;
};
exports.nextRank = nextRank;
const getCurrentPlayer = (state) => state.players[(0, exports.getPlayerTurn)(state, state.turn)];
exports.getCurrentPlayer = getCurrentPlayer;
const getPlayerByName = (state, name) => state.players.filter(p => p.name === name)[0];
exports.getPlayerByName = getPlayerByName;
const getPlayerTurn = (state, turnIndex) => turnIndex % state.players.length;
exports.getPlayerTurn = getPlayerTurn;
