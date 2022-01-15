//#region main export types
export interface ShanghaiGame {
    options: ShanghaiOptions
    state?: ShanghaiState
}

export type ActionResponse = {
    success: boolean
    error?: string
    message?: string
}

export type ShanghaiOptions = {
    players: string[]
    deckCount: number
    jokerCount: number
    shanghaiCount: number
    rounds: RoundConfig[]
}

export type ShanghaiState = {
    players: Player[]
    roundNumber: number
    turn: number
    shanghaiIsAllowed: boolean
    shanghaiFor: string | null
    deck: Card[]
    discarded: Card[]
    roundIsOn: boolean
    winner?: string
}

export type Action = {
    playerName: string
    setReady?: boolean
    revealDeck?: boolean
    takeDiscard?: boolean
    takeDeck?: boolean
    meld?: MeldAction
    addToMeld?: AddToMeldAction
    discardID?: number
    shanghai?: boolean
    allowShanghai?: boolean
}
//#endregion

export type Player = {
    name: string
    isReady: boolean
    points: number
    cards: Card[]
    melded: MeldedMeld[]
    shanghaiCount: number
    canTakeCard: boolean
}

export type Card = {
    id: number
    suit: CSuit
    rank: CRank
    mustBeMelded?: boolean
}

export type CSuit = "heart" | "spade" | "diamond" | "club"
export type CJokerRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
export type CRank = CJokerRank | 25

export type RoundConfig = {
    description: string
    cardCount: number
    melds: Meld[]
}

export type Meld = {
    type: MeldType
    length: number
}

export type MeldType = "set" | "straight"

export type MeldedMeld = {
    cards: Card[]
}

// The entire meld of a player, with each meld of the array
// corresponding to the meld of the same index in roundConfig melds
export type MeldAction = {
    melds: MeldCards[]
}

export type AddToMeldAction = {
    targetPlayer: string
    targetMeldIndex: number
    cardToMeldId: number
    replaceJoker?: boolean
    targetMeldInsertIndex?: number
}

// Single meld array, where each index corresponds to a players card
export type MeldCards = {
    cardIDs: number[]
}


export const suitFromNumber = (n: number): CSuit => {
    const v = n % 4
    switch (v) {
        case 0:
            return "heart"
        case 1:
            return "spade"
        case 2:
            return "diamond"
        default:
            return "club"
    }
}

export const cardToString = (card: Card) => `${rankToString(card.rank)} of ${card.suit}s`

export const rankToString = (rank: CRank): string => {
    switch (rank) {
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
            return `${rank}`
    }
}


export const suitToString = (rank: CSuit): string => {
    switch (rank) {
        case 'heart':
            return '♥'
        case 'diamond':
            return '♦'
        case 'spade':
            return '♠'
        default:
            return '♣'
    }
}

export const nextRank = (rank: CJokerRank, loop = false) => {
    let rankAdd = rank + 1
    if (rank > 14) {
        return loop ? 2 : undefined
    }
    return rankAdd as CJokerRank
}

export const getCurrentPlayer = (state: ShanghaiState) => state.players[getPlayerTurn(state, state.turn)]

export const getPlayerByName = (state: ShanghaiState, name: string) => state.players.filter(p => p.name === name)[0]

export const getPlayerTurn = (state: ShanghaiState, turnIndex: number) => turnIndex % state.players.length