import React from 'react'
import { ActionResponse, FullPlayer, ShanghaiGame, ShanghaiOptions, ShanghaiState } from '../shared'

type StartedShanghaiGame = ShanghaiGame & {
    state: ShanghaiState
}

type GameContextType = {
    myPlayerId: number
    game: StartedShanghaiGame
    actionResponse: ActionResponse
    setActionResponse: (a: ActionResponse) => void
    selectedCard: SelectedCard,
    setSelectedCard: (n: number | undefined) => void
    hiddenCards: number[],
    setHiddenCards: (n: number[]) => void
    getCurrentPlayer: () => FullPlayer
    getPlayer: (id: number) => FullPlayer
}

export type SelectedCard = {
    selectedCardID?: number,
    actionHighlightCardID?: number
}

const defaultGameContext: GameContextType = {
    // Dirty trick but Shanghai game does not have a default value but it cannot be undefined either within this context
    game: undefined as unknown as StartedShanghaiGame,
    myPlayerId: -1,
    actionResponse: {
        success: true
    },
    setActionResponse: () => { },
    selectedCard: {},
    setSelectedCard: () => { },
    hiddenCards: [],
    setHiddenCards: () => { },
    getCurrentPlayer: () => undefined as unknown as FullPlayer,
    getPlayer: (i) => undefined as unknown as FullPlayer
}

export const GameContext = React.createContext(
    defaultGameContext
)
