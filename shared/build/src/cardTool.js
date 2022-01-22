"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const rankMask = (Math.pow(2, 10) - 1);
const suitMask = (Math.pow(2, 10) - 1) << 10;
const deckMask = (Math.pow(2, 10) - 1) << 20;
const fromId = (id) => {
    const rank = (id & rankMask);
    const suit = (id & suitMask) >> 10;
    const deck = ((id & deckMask) >> 20);
    return fromValues(rank, suit, deck);
};
const fromValues = (rank, suit, deck) => {
    return {
        id: rank + (suit << 10) + (deck << 20),
        rank: rank,
        suit: suit,
        deck: deck
    };
};
const color = (card) => {
    return card.suit % 2 == 0 ? 'black' : 'red';
};
const name = (card) => {
    if (card.rank === 25)
        return 'Joker';
    return index_1.CSuitIcon[card.suit] + rankPrefix(card);
};
const longName = (card) => {
    if (card.rank === 25)
        return `${color(card)} Joker`;
    return `${rankName(card)} of ${index_1.CSuit[card.suit]}s`;
};
const suitName = (card) => index_1.CSuit[card.suit];
const suitIcon = (card) => index_1.CSuitIcon[card.suit];
const rankPrefix = (card) => {
    if (card.rank === 25)
        return 'JOKER';
    if (card.rank >= 11 && card.rank <= 14)
        return rankName(card)[0];
    return `${card.rank}`;
};
const rankName = (card) => {
    switch (card.rank) {
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
            return `${card.rank}`;
    }
};
const nextRank = (rank, loop = false) => {
    const rankAdd = rank + 1;
    if (rankAdd > 14) {
        return loop ? 2 : undefined;
    }
    return rankAdd;
};
exports.default = {
    fromId,
    fromValues,
    color,
    name,
    longName,
    suitName,
    suitIcon,
    rankName,
    rankPrefix,
    nextRank
};
//# sourceMappingURL=cardTool.js.map