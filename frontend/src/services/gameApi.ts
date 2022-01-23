import axios from 'axios'
import { Action, ActionResponse, GameParams, GameJoinParams, ShanghaiGame, ShanghaiState, GamePlayerParams } from 'shared'

//const baseURL = 'localhost:3001/api/'
const baseURL = '/api/game'

const timeout = 5000

export const getGame = async (gameId: string): Promise<ShanghaiGame> => {
    const url = apiPath("")

    const data: GameParams = {
        gameId
    }

    const res = await axios({
        method: 'post',
        url,
        data,
        timeout

    })

    if (res.status === 200) {
        return res.data as ShanghaiGame
    }

    throw "Error"
}

export const getGameState = async (gameId: string): Promise<ShanghaiState> => {
    const url = apiPath("/state")

    const data: GameParams = {
        gameId
    }

    const res = await axios({
        method: 'post',
        url,
        data,
        timeout

    })
    if (res.status === 200) {
        return res.data as ShanghaiState
    }

    throw "Error"
}

export const startNewGame = async (game: GameJoinParams): Promise<ShanghaiGame | undefined> => {
    const url = apiPath("/new")

    const data = {
        data: game
    }

    const res = await axios({
        method: 'post',
        url,
        data,
        timeout
    })

    if (res.status === 200 && res.data) {
        return res.data as ShanghaiGame
    }
}

export const joinGame = async (game: GameJoinParams): Promise<ShanghaiGame | undefined> => {
    const url = apiPath("/join")

    const data = {
        data: game
    }

    const res = await axios({
        method: 'post',
        url,
        data,
        timeout
    })

    if (res.status === 200 && res.data) {
        return res.data as ShanghaiGame
    }
}

export const setPlayerReady = async (params: GamePlayerParams): Promise<boolean> => {
    const url = apiPath("/ready")

    const data = {
        data: params
    }

    const res = await axios({
        method: 'post',
        url,
        data,
        timeout
    })

    return res.status === 200
}

export const executePlayerAction = async (action: Action): Promise<ActionResponse> => {
    const url = apiPath("/action")

    const data = {
        data: action
    }

    const res = await axios({
        method: 'post',
        url,
        data,
        timeout
    })

    if (res.status === 200 && res.data) {
        return res.data as ActionResponse
    }

    throw "Error in action post"
}

const apiPath = (endpoint: string) => {
    return baseURL + endpoint
}