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
    discard?: Card
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
}

export type Card = {
    id: number
    suit: CSuit
    rank: CRank
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
    targetMeldInsertIndex: number
}

// Single meld array, where each index corresponds to a players card
export type MeldCards = {
    cardIDs: number[]
}
