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
    discardTopOwner?: string
    roundIsOn: boolean
    winner?: string
    message?: string
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
    deck: CDeck
    mustBeMelded?: boolean
}

export enum CSuit {
    club,
    heart,
    spade,
    diamond
}

export enum CSuitIcon {
    '♣',
    '♥',
    '♠',
    '♦'
}

export type CNormalRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
export type CRank = CNormalRank | 25
export type CDeck = 0 | 1
export type CColor = 'red' | 'black'

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
    insertBehind?: boolean
}

// Single meld array, where each index corresponds to a players card
export type MeldCards = {
    cardIDs: number[]
}

export const getCurrentPlayer = (state: ShanghaiState) => state.players[getPlayerTurn(state, state.turn)]

export const getPlayerByName = (state: ShanghaiState, name: string) => state.players.filter(p => p.name === name)[0]

export const getPlayerTurn = (state: ShanghaiState, turnIndex: number) => turnIndex % state.players.length