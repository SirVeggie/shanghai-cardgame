import React from 'react'
import { ActionResponse, ShanghaiOptions, ShanghaiState } from '../shared'

type GameContextType = {
    myPlayerName: string
    options: ShanghaiOptions
    state: ShanghaiState
    actionResponse: ActionResponse
    setActionResponse: (a: ActionResponse) => void
    selectedCard: SelectedCard,
    setSelectedCard: (n: number | undefined) => void
    hiddenCards: number[],
    setHiddenCards: (n: number[]) => void
}

export type SelectedCard = {
    selectedCardID?: number,
    actionHighlightCardID?: number
}

const defaultGameContext: GameContextType = {
    myPlayerName: "noname",
    options: {
        players: [],
        shanghaiCount: 0,
        jokerCount: 0,
        deckCount: 0,
        rounds: []
    },
    state: {
        players: [],
        roundIsOn: false,
        roundNumber: 0,
        turn: 0,
        shanghaiFor: null,
        shanghaiIsAllowed: false,
        deck: [],
        discarded: []
    },
    actionResponse: {
        success: true
    },
    setActionResponse: () => { },
    selectedCard: {},
    setSelectedCard: () => { },
    hiddenCards: [],
    setHiddenCards: () => { }
}

export const GameContext = React.createContext(
    defaultGameContext
)
