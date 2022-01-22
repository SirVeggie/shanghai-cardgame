import axios from 'axios'
import { Action, ActionResponse, GameParams, GameJoinParams, ShanghaiGame, ShanghaiState } from 'shared'

//const baseURL = 'localhost:3001/api/'
const baseURL = '/api/game/'

const timeout = 5000

export const getGame = async (gameId: string): Promise<ShanghaiGame> => {
    const url = apiPath("game")

    const data: GameParams = {
        gameId
    }

    const res = await axios({
        method: 'get',
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
    const url = apiPath("game/state")

    const data: GameParams = {
        gameId
    }

    const res = await axios({
        method: 'get',
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
    const url = apiPath("game/new")

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
    const url = apiPath("game/join")

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

export const executePlayerAction = async (action: Action): Promise<ActionResponse> => {
    const url = apiPath("game/action")

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