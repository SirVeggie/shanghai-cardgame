//#region main types
interface ShanghaiGame {
    options: ShanghaiOptions
    state: ShanghaiState
}

type ShanghaiOptions = {
    players: string[]
    deckCount: number
    jokerCount: number
    shanghaiCount: number
    rounds: RoundConfig[]
}

type ShanghaiState = {
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

type Action = {
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

type Player = {
    name: string
    isReady: boolean
    points: number
    cards: Card[]
    melded: MeldedMeld[]
    shanghaiCount: number
}

type Card = {
    id: number
    suit: CSuit
    rank: CRank
}

type CSuit = "heart" | "spade" | "diamond" | "club"
type CJokerRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14
type CRank = CJokerRank | 25

type RoundConfig = {
    description: string
    cardCount: number
    melds: Meld[]
}

type Meld = {
    type: MeldType
    length: number
}

type MeldType = "set" | "straight"

type MeldedMeld = {
    cards: Card[]
}

// The entire meld of a player, with each meld of the array
// corresponding to the meld of the same index in roundConfig melds
type MeldAction = {
    melds: MeldCards[]
}

type AddToMeldAction = {
    targetPlayer: string
    targetMeldIndex: number
    cardToMeldId: number
    targetMeldInsertIndex: number
}

// Single meld array, where each index corresponds to a players card
type MeldCards = {
    cardIDs: number[]
}
