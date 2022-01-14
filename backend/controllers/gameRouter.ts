import { Router } from 'express'
import { getGame, getState, handleAction, startGame } from '../game/shanghai'
import { getDefaultConfiguration } from '../game/shanghaiGameConfig'
import { ShanghaiGame, Action } from '../../frontend/src/shared'

const router = Router()

const UPDATE_INTERVAL = 3000
const SYNC_ACCURACY = 100

router.get('/options', async (req, res) => {
    return res.json(getGame())
})

router.get('/state', async (req, res) => {
    const startTime = new Date().getTime()
    while (true) {
        const currentTime = new Date().getTime()
        if (currentTime - startTime >= UPDATE_INTERVAL) {
            break
        }

        const mod = currentTime % UPDATE_INTERVAL

        // sync state requests
        if (mod <= SYNC_ACCURACY) {
            break
        }

        await sleep(10)
    }

    return res.json(getState())
})

router.get('/newgame', async (req, res) => {
    startGame({ options: getDefaultConfiguration() })
    return res.status(200).send()
})

router.post('/newgame', async (req, res) => {
    const game = req.body["game"] as ShanghaiGame

    if (game) {
        startGame(game)
    } else {
        startGame({ options: getDefaultConfiguration() })
    }

    return res.status(200).send()
})

router.post('/action', async (req, res) => {
    const action = req.body["action"] as Action
    return res.json(handleAction(action))
})

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default router;