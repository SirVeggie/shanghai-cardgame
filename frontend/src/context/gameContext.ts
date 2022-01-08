import React from "react";
import { ShanghaiOptions, ShanghaiState } from "../../..";

type GameContextType = {
    myPlayerName: string
    options: ShanghaiOptions
    state: ShanghaiState
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
    }
}

export const GameContext = React.createContext(
    defaultGameContext
)
