"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../shared");
const rankMask = (2 ** 4 - 1);
const suitMask = (2 ** 2 - 1) << 4;
const deckMask = (2 ** 3 - 1) << 6;
const fromId = (id) => {
    const rank = (id & rankMask);
    const suit = (id & suitMask) >> 4;
    const deck = ((id & deckMask) >> 6);
    return fromValues(rank, suit, deck);
};
const fromValues = (rank, suit, deck) => {
    return {
        id: rank + (suit << 4) + (deck << 6),
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
    return shared_1.CSuitIcon[card.suit] + rankPrefix(card);
};
const longName = (card) => {
    if (card.rank === 25)
        return `${color(card)} Joker`;
    return `${rankName(card)} of ${card.suit}s`;
};
const suitName = (card) => shared_1.CSuit[card.suit];
const suitIcon = (card) => shared_1.CSuitIcon[card.suit];
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
