import { Card, CRank, CSuit, CSuitIcon, CColor, CNormalRank } from '../index'

const rankMask = (2 ** 10 - 1)
const suitMask = (2 ** 10 - 1) << 10
const deckMask = (2 ** 10 - 1) << 20

const fromId = (id: number): Card => {
    const rank = (id & rankMask) as CRank
    const suit = (id & suitMask) >> 10
    const deck = ((id & deckMask) >> 20)
    return fromValues(rank, suit, deck)
}

const fromValues = (rank: CRank, suit: CSuit, deck: number): Card => {
    return {
        id: rank + (suit << 10) + (deck << 20),
        rank: rank,
        suit: suit,
        deck: deck
    }
}

const color = (card: Card): CColor => {
    return card.suit % 2 == 0 ? 'black' : 'red'
}

const name = (card: Card): string => {
    if (card.rank === 25)
        return 'Joker'
    return CSuitIcon[card.suit] + rankPrefix(card)
}

const longName = (card: Card): string => {
    if (card.rank === 25)
        return `${color(card)} Joker`
    return `${rankName(card)} of ${CSuit[card.suit]}s`
}

const suitName = (card: Card): string => CSuit[card.suit]
const suitIcon = (card: Card): string => CSuitIcon[card.suit]

const rankPrefix = (card: Card): string => {
    if (card.rank === 25)
        return 'JOKER'
    if (card.rank >= 11 && card.rank <= 14)
        return rankName(card)[0]
    return `${card.rank}`
}

const rankName = (card: Card): string => {
    switch (card.rank) {
        case 11:
            return "Jack"
        case 12:
            return "Queen"
        case 13:
            return "King"
        case 14:
            return "Ace"
        case 25:
            return "Joker"
        default:
            return `${card.rank}`
    }
}

const nextRank = (rank: CNormalRank, loop = false) => {
    const rankAdd = rank + 1
    if (rankAdd > 14) {
        return loop ? 2 : undefined
    }
    return rankAdd as CNormalRank
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
}
