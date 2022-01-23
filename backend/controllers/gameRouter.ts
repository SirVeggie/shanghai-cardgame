import { Router } from 'express'
import { usingGameContext } from '../game/shanghai'
import { Action, GameJoinParams, GamePlayerParams } from 'shared';
import { addPlayerToGame, createNewGame, getGameById, getGameByName, updateGame } from '../game/gameManger'
import { startGame } from '../game/shanghaiGameConfig';

const router = Router()

const UPDATE_INTERVAL = 1000
const SYNC_ACCURACY = 100

router.post('', async (req, res) => {
    const gameId = req.body["gameId"] as string
    const game = getGameById(gameId)
    if (!game) {
        return res.status(404)
    }
    return res.json(game)
})

router.post('/state', async (req, res) => {
    const gameId = req.body["gameId"] as string
    const game = getGameById(gameId)
    if (!game?.state) {
        return res.status(404)
    }

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

    return res.json(game.state)
})

router.post('/new', async (req, res) => {
    const gameParams = req.body["data"] as GameJoinParams
    const newId = createNewGame(gameParams)

    console.log({ gameParams })

    if (!newId) {
        return res.status(400).send()
    }

    const game = getGameById(newId)

    if (!game) {
        throw "Game did not exist after creation"
    }

    return res.json(game)
})

router.post('/join', async (req, res) => {
    const gameParams = req.body["data"] as GameJoinParams

    const game = getGameByName(gameParams.lobbyName)
    console.log({ game })

    if (!game) {
        console.log('game not found')
        return res.status(400).send()
    }

    if (game.password?.length && game.password !== gameParams.password) {
        return res.status(401).send()
    }

    const player = game.options.players.find(p => p.name === gameParams.playerName)
    if (player) {
        return res.json(game)
    }

    // Cannot join after game started
    if (game.state) {
        return res.status(400).send()
    }

    const newGame = addPlayerToGame(game.id, gameParams.playerName)

    if (!newGame) {
        return res.status(400).send()
    }

    updateGame(game.id, newGame)

    return res.json(newGame)
})

router.post('/ready', async (req, res) => {
    const data = req.body["data"] as GamePlayerParams
    let game = getGameById(data.gameId)

    if (!game) {
        return res.status(400).send()
    }

    const player = game.options.players.find(p => p.id === data.playerId)

    if (!player) {
        return res.status(400).send()
    }

    player.isReady = true

    if (!game.state) {
        const allReady = game.options.players.length > 1 && !game.options.players.some(p => !p.isReady)
        if (allReady) {
            game = startGame(game)
        }
    }

    if (game.state) {
        usingGameContext(game.options, game.state, (h, checkGameContinue, getState) => {
            checkGameContinue()
            game!.state = getState()
        })
    }

    updateGame(data.gameId, game)
    return res.status(200).send()
})

router.post('/action', async (req, res) => {
    const action = req.body["data"] as Action
    const game = getGameById(action.gameId)

    if (!game?.state) {
        return res.status(400).send()
    }

    usingGameContext(game.options, game.state, (handleAction, g, getState) => {
        const response = handleAction(action)

        if (response.success) {
            updateGame(action.gameId, { ...game, state: getState() })
        }

        res.json(response)
    })
})

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default router;