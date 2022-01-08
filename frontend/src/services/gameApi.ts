import axios from 'axios'
import { Action, ActionResponse, ShanghaiGame, ShanghaiOptions, ShanghaiState } from '../../../'

//const baseURL = 'localhost:3001/api/'
const baseURL = '/api/game/'

const TIMEOUT = 5000

export const getGameOptions = async (): Promise<ShanghaiOptions> => {
    const path = apiPath("options")
    const res = await axios.get(path, {
        timeout: TIMEOUT
    })

    if (res.status === 200) {
        return res.data as ShanghaiOptions
    }

    throw "Error"
}

export const getGameState = async (): Promise<ShanghaiState> => {
    const path = apiPath("state")
    const res = await axios.get(path, {
        timeout: TIMEOUT
    })

    if (res.status === 200) {
        return res.data as ShanghaiState
    }

    throw "Error"
}

export const startGame = async (game: ShanghaiGame | undefined) => {
    const path = apiPath("newgame")

    const body = {
        game
    }

    const res = await axios({
        method: 'post',
        url: path,
        data: body,
        timeout: TIMEOUT
    })
}

export const playerAction = async (action: Action): Promise<ActionResponse> => {
    const path = apiPath("action")

    const body = {
        action
    }

    const res = await axios({
        method: 'post',
        url: path,
        data: body,
        timeout: TIMEOUT
    })

    if (res.status === 200) {
        return res.data as ActionResponse
    }

    throw "Error in action post"
}

const apiPath = (endpoint: string) => {
    return baseURL + endpoint
}