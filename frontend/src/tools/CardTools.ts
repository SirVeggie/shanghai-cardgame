import { Card, CRank, CSuit, CDeck, CSuitIcon, CColor, CNormalRank } from '../shared';

const rankMask = (2 ** 4 - 1);
const suitMask = (2 ** 2 - 1) << 4;
const deckMask = (2 ** 3 - 1) << 6;

const fromId = (id: number): Card => {
    const rank = (id & rankMask) as CRank;
    const suit = (id & suitMask) >> 4;
    const deck = ((id & deckMask) >> 6) as CDeck;
    return fromValues(rank, suit, deck);
};

const fromValues = (rank: CRank, suit: CSuit, deck: CDeck): Card => {
    return {
        id: rank + (suit << 4) + (deck << 6),
        rank: rank,
        suit: suit,
        deck: deck
    };
};

const color = (card: Card): CColor => {
    return card.suit % 2 == 0 ? 'black' : 'red';
};

const name = (card: Card): string => {
    if (card.rank === 25)
        return 'Joker';
    return CSuitIcon[card.suit] + rankPrefix(card);
};

const longName = (card: Card): string => {
    if (card.rank === 25)
        return `${color(card)} Joker`;
    return `${rankName(card)} of ${card.suit}s`;
};

const suitName = (card: Card): string => CSuit[card.suit];
const suitIcon = (card: Card): string => CSuitIcon[card.suit];

const rankPrefix = (card: Card): string => {
    if (card.rank === 25)
        return 'JOKER';
    if (card.rank >= 11 && card.rank <= 14)
        return rankName(card)[0];
    return `${card.rank}`;
};

const rankName = (card: Card): string => {
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

const nextRank = (rank: CNormalRank, loop = false) => {
    const rankAdd = rank + 1;
    if (rankAdd > 14) {
        return loop ? 2 : undefined;
    }
    return rankAdd as CNormalRank;
};

export default {
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
