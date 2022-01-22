import CardTool from './src/cardTool'

export const ctool = CardTool;

export type GameJoinParams = {
    lobbyName: string,
    playerName: string
    password?: string
}

export type GameParams = {
    gameId: string
}

//#region main export types
export type Shanghai = {
    options: ShanghaiOptions,
    state: ShanghaiState
}

export interface ShanghaiGame {
    id: string
    name: string
    startedAt: Date
    updatedAt: Date
    options: ShanghaiOptions
    password?: string
    state?: ShanghaiState
}

export type ActionResponse = {
    success: boolean
    error?: string
    message?: string
}

export type ShanghaiOptions = {
    players: Player[]
    shanghaiCount: number
    rounds: RoundConfig[]
}

export type ShanghaiState = {
    players: GamePlayer[]
    roundNumber: number
    turn: number
    shanghaiIsAllowed: boolean
    shanghaiForId?: number
    deck: Card[]
    discarded: Card[]
    discardTopOwnerId?: number
    roundIsOn: boolean
    winnerId?: number
    message?: string
}

export type Action = {
    playerId: number
    gameId: string
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
    id: number
    name: string
    isReady: boolean
}

export type GamePlayer = {
    id: number
    points: number
    cards: Card[]
    melded: MeldedMeld[]
    shanghaiCount: number
    canTakeCard: boolean
    actionRelatedCardID?: number
}

export type FullPlayer = Player & GamePlayer

export type Card = {
    id: number
    suit: CSuit
    rank: CRank
    deck: number
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
export type CColor = 'red' | 'black'

export type RoundConfig = {
    description: string
    cardCount: number
    deckCount: number
    jokerCount: number
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
    targetPlayerId: number
    targetMeldIndex: number
    cardToMeldId: number
    replaceJoker?: boolean
    insertBehind?: boolean
}

// Single meld array, where each index corresponds to a players card
export type MeldCards = {
    cardIDs: number[]
}

export const cardOrderIndex = (card: Card): number => card.suit * 1000 + card.rank * 10 + card.deck

export const getPlayerTurn = (state: ShanghaiState, turnIndex: number) => turnIndex % state.players.length

export const getFullPlayer = (player: Player, state: ShanghaiState) => {
    return {
        ...player,
        ...state.players[player.id]
    }
}
