import style from './game.module.scss'
import { useEffect, useState } from "react"
import { ActionResponse, GameJoinParams, getFullPlayer, getPlayerTurn, ShanghaiGame } from 'shared'
import { GameContext } from "../context/gameContext"
import { getGame, getGameState, joinGame, setPlayerReady, startNewGame } from "../services/gameApi"
import { GameView } from "./gameView"
import { GameJoinConfig, JoinType } from "./gameJoinConfig"

// dumb but ez solution
let updateInProgress = false
const debugMode = false

const Game = () => {
    const [myPlayerId, setMyPlayerId] = useState<number>()
    const [game, setGame] = useState<ShanghaiGame>()
    const [actionResponse, setActionResponse] = useState<ActionResponse>({ success: true })
    const [selectedCard, setSelectedCard] = useState<number>()
    const [hiddenCards, setHiddenCards] = useState<number[]>([])

    const gameGetter = () => game

    const getCurrentPlayer = () => {
        if (!game?.state) {
            throw "Game not setup"
        }

        const player = game.options.players[getPlayerTurn(game.state, game.state.turn)]
        return getFullPlayer(player, game.state)
    }
    const getPlayer = (id: number) => {
        if (!game?.state) {
            throw "Game not setup"
        }

        const player = game.options.players[id]
        return getFullPlayer(player, game.state)
    }

    const updateGame = (cb: (g: ShanghaiGame | undefined) => void) => {
        if (!game) {
            cb(undefined)
            return
        }

        getGame(game.id).then(game => {
            setGame(game)
            cb(game)
        })
    }

    console.log({ game })

    const [prevTurn, setPrevTurn] = useState(-1)

    console.log({ selectedCard })

    if (game?.state) {
        if (prevTurn !== game.state.turn) {
            const json = JSON.stringify(game)
            localStorage.setItem("game", json)
            setPrevTurn(game.state.turn)
        }

        const currentPlayer = getCurrentPlayer()
        if (debugMode && myPlayerId !== currentPlayer.id) {
            setMyPlayerId(currentPlayer.id)
        }
        if (debugMode && game.options.players.some(p => !p.isReady)) {
            if (myPlayerId !== undefined) {
                game.state.players.forEach(p => setPlayerReady({ gameId: game.id, playerId: p.id }))
            }
        }
    }


    useEffect(() => {
        const interval = setInterval(async () => {
            if (!game || updateInProgress) {
                return
            }
            try {
                updateInProgress = true
                console.log({ game: game })

                if (!game.state) {
                    console.log('update game')
                    updateGame(() => { })
                    await sleep(2000)
                    updateInProgress = false
                    return
                }

                console.log('updte game stte')
                const state = await getGameState(game.id)
                updateInProgress = false
                setGame({ ...game, state })
            } catch (e) {
                updateInProgress = false
                await sleep(1000)
            }

        }, 200)
        return () => clearInterval(interval)
    }, [game, setGame])

    const onSubmitJoinOrCreate = (join: JoinType, gameParams: GameJoinParams) => {
        setMyPlayerId(-1)
        const onReceiveGame = (newGame: ShanghaiGame | undefined) => {
            if (game) {
                console.log('game existed')
                return
            }

            if (newGame) {
                const player = newGame.options.players.find(p => p.name === gameParams.playerName)
                // websocket connect here maybe?
                setMyPlayerId(player?.id)
                setGame(newGame)
                console.log('set new game')
            } else {
                setMyPlayerId(undefined)
            }
        }

        join === 'create' ? startNewGame(gameParams).then(onReceiveGame) : joinGame(gameParams).then(onReceiveGame)
    }

    if (myPlayerId === -1) {
        return <div>Loading...</div>
    }

    if (!game) {
        return <GameJoinConfig onSubmit={onSubmitJoinOrCreate} />
    }

    if (myPlayerId === undefined) {
        return <div>Error, refresh</div>
    }

    // Game not started
    if (!game.state) {
        return <div>
            <button onClick={() => setPlayerReady({ gameId: game.id, playerId: myPlayerId }).then(res => {
                console.log("ready cb, " + res)
                console.log({ game })
                if (res) {
                    updateGame(() => { })
                }
            })}>Ready</button>
            <div className={style.vert}>
                {game.options.players.map(p => (<span key={'p-' + p.id}>{p.name}: {p.isReady ? 'Ready' : 'Not ready'}</span>))}
            </div>
        </div>
    }
    const myPlayer = getPlayer(myPlayerId)

    return (
        <GameContext.Provider value={{
            myPlayerId,
            game: { ...game, state: game.state },
            actionResponse,
            setActionResponse,
            selectedCard: {
                selectedCardID: selectedCard,
                actionHighlightCardID: myPlayer.actionRelatedCardID
            },
            setSelectedCard,
            hiddenCards,
            setHiddenCards,
            getCurrentPlayer,
            getPlayer
        }}>
            <GameView />
        </GameContext.Provider>
    )
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export default Game
