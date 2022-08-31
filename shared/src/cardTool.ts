import { Card, CardRank, CardSuit, CSuitIcon, CardColor, NormalRank, JOKER_RANK } from './types';

const rankMask = (2 ** 10 - 1);
const suitMask = (2 ** 10 - 1) << 10;
const deckMask = (2 ** 10 - 1) << 20;

function fromId(id: number): Card {
    const rank = (id & rankMask) as CardRank;
    const suit = (id & suitMask) >> 10;
    const deck = ((id & deckMask) >> 20);
    return fromValues(rank, suit, deck);
}

function fromValues(rank: CardRank, suit: CardSuit, deck: number): Card {
    return {
        id: rank + (suit << 10) + (deck << 20),
        rank: rank,
        suit: suit,
        deck: deck
    };
}

function color(card: Card): CardColor {
    return card.suit % 2 === 0 ? 'black' : 'red';
}

function name (card: Card): string {
    if (card.rank === JOKER_RANK)
        return 'Joker';
    return CSuitIcon[card.suit] + rankPrefix(card);
}

function longName (card: Card): string {
    if (card.rank === JOKER_RANK)
        return `${color(card)} Joker`;
    return `${rankName(card)} of ${CardSuit[card.suit]}s`;
}

function suitName(card: Card): string {
    return CardSuit[card.suit];
}

function suitIcon(card: Card): string {
    return CSuitIcon[card.suit];
}

function rankPrefix (card: Card): string {
    if (card.rank === JOKER_RANK)
        return 'JOKER';
    if (card.rank >= 11 && card.rank <= 14)
        return rankName(card)[0];
    return `${card.rank}`;
}

function rankName (card: Card): string {
    switch (card.rank) {
        case 11:
            return 'Jack';
        case 12:
            return 'Queen';
        case 13:
            return 'King';
        case 14:
            return 'Ace';
        case JOKER_RANK:
            return 'Joker';
        default:
            return `${card.rank}`;
    }
}

function nextRank (rank: NormalRank, loop = false) {
    const rankAdd = rank + 1;
    if (rankAdd > 14) {
        return loop ? 2 : undefined;
    }
    return rankAdd as NormalRank;
}

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
