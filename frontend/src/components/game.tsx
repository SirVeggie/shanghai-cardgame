import { useEffect, useState } from "react"
import { ActionResponse, getCurrentPlayer, getPlayerByName, ShanghaiGame, ShanghaiOptions, ShanghaiState } from "../shared"
import { GameContext } from "../context/gameContext"
import { getGameOptions, getGameState } from "../services/gameApi"
import { GameView } from "./gameView"
import { NameInput } from "./nameInput"
import { actionSetReady } from "./playerActions"

// dumb but ez solution
let updateInProgress = false
const debugMode = true

const Game = () => {
    const [myPlayerName, setMyPlayerName] = useState<string | undefined>()
    const [gameOptions, setGameOptions] = useState<ShanghaiOptions>()
    const [gameState, setGameState] = useState<ShanghaiState>()
    const [actionResponse, setActionResponse] = useState<ActionResponse>({ success: true })
    const [selectedCard, setSelectedCard] = useState<number>()
    const [hiddenCards, setHiddenCards] = useState<number[]>([])


    const [prevTurn, setPrevTurn] = useState(-1)

    console.log({ selectedCard })
    console.log({ gameOptions, gameState })

    // debug
    //const myPlayerName = gameState?.players[gameState.turn % 4]?.name ?? ''
    console.log("Player name: " + myPlayerName)

    if (gameState && gameOptions) {
        console.log(getPlayerByName(gameState, myPlayerName!).cards)
        if (prevTurn !== gameState.turn) {
            const game: ShanghaiGame = {
                state: gameState,
                options: gameOptions
            }

            const json = JSON.stringify(game)
            localStorage.setItem("game", json)
            setPrevTurn(gameState.turn)
        }

        const currentPlayer = getCurrentPlayer(gameState).name
        if (debugMode && myPlayerName !== currentPlayer) {
            setMyPlayerName(currentPlayer)
        }
        if (debugMode && gameState.players.some(p => !p.isReady)) {
            gameState.players.forEach(p => actionSetReady(setActionResponse, p.name))
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (updateInProgress) {
                return
            }
            updateInProgress = true

            getGameState().then(state => {
                console.log("Updated game state")
                updateInProgress = false
                setGameState(state)
            })
        }, 200)
        return () => clearInterval(interval)
    }, [])

    if (!myPlayerName?.length) {
        return <NameInput setName={setMyPlayerName} />
    }

    if (!gameOptions) {
        getGameOptions().then(opt => {
            setGameOptions(opt)
        })
    }

    if (!gameOptions || !gameState) {
        return <div>Loading...</div>
    }

    // Game not started
    if (gameState && gameState.roundNumber < 0) {
        return <div>
            <button onClick={() => actionSetReady(setActionResponse, myPlayerName)}>Ready</button>
        </div>
    }

    const myPlayer = getPlayerByName(gameState, myPlayerName)


    console.log("render game view")
    return (
        <GameContext.Provider value={{
            myPlayerName,
            options: gameOptions,
            state: gameState,
            actionResponse,
            setActionResponse,
            selectedCard: selectedCard ?? myPlayer.actionRelatedCardID,
            setSelectedCard,
            hiddenCards,
            setHiddenCards
        }}>
            <GameView />
        </GameContext.Provider>
    )
}

export default Game
