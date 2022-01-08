"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextRank = exports.rankToString = exports.cardToString = exports.suitFromNumber = void 0;
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
const nextRank = (rank) => {
    let rankAdd = rank + 1;
    if (rank > 14) {
        return undefined;
    }
    return rankAdd;
};
exports.nextRank = nextRank;
