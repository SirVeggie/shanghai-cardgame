import { useEffect, useState } from "react"
import { ActionResponse, GameJoinParams, getFullPlayer, getPlayerTurn, ShanghaiGame, ShanghaiOptions, ShanghaiState } from "../shared"
import { GameContext } from "../context/gameContext"
import { getGameState, joinGame, startNewGame } from "../services/gameApi"
import { GameView } from "./gameView"
import { GameJoinConfig, JoinType } from "./gameJoinConfig"
import { actionSetReady } from "./playerActions"

// dumb but ez solution
let updateInProgress = false
const debugMode = false

const Game = () => {
    const [myPlayerId, setMyPlayerId] = useState<number>()
    const [game, setGame] = useState<ShanghaiGame>()
    const [actionResponse, setActionResponse] = useState<ActionResponse>({ success: true })
    const [selectedCard, setSelectedCard] = useState<number>()
    const [hiddenCards, setHiddenCards] = useState<number[]>([])

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
            game.state.players.forEach(p => actionSetReady(setActionResponse, game.id, p.id))
        }
    }


    useEffect(() => {
        const interval = setInterval(() => {
            if (!game || updateInProgress) {
                return
            }
            updateInProgress = true

            getGameState(game.id).then(state => {
                updateInProgress = false
                setGame({ ...game, state })
            })
        }, 200)
        return () => clearInterval(interval)
    }, [])

    const onSubmitJoinOrCreate = (join: JoinType, gameParams: GameJoinParams) => {
        setMyPlayerId(-1)
        const onReceiveGame = (newGame: ShanghaiGame | undefined) => {
            if (game) {
                return
            }

            if (newGame) {
                const player = newGame.options.players.find(p => p.name === gameParams.playerName)
                // websocket connect here maybe?
                setMyPlayerId(player?.id)
                setGame(newGame)
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
    if (!game.state || game.state.roundNumber < 0) {
        return <div>
            <button onClick={() => actionSetReady(setActionResponse, game.id, myPlayerId)}>Ready</button>
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

export default Game
