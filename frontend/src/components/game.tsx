import { useEffect, useState } from "react"
import { ActionResponse, ShanghaiGame, ShanghaiOptions, ShanghaiState } from "../shared"
import { GameContext } from "../context/gameContext"
import { getGameOptions, getGameState } from "../services/gameApi"
import { GameView } from "./gameView"
import { NameInput } from "./nameInput"

// dumb but ez solution
let updateInProgress = false

const Game = () => {
    const [myPlayerNameState, setMyPlayerName] = useState<string | undefined>("Niko")
    const [gameOptions, setGameOptions] = useState<ShanghaiOptions>()
    const [gameState, setGameState] = useState<ShanghaiState>()
    const [actionResponse, setActionResponse] = useState<ActionResponse>({ success: true })
    const [selectedCard, setSelectedCard] = useState<number>()
    const [hiddenCards, setHiddenCards] = useState<number[]>([])
    const [prevTurn, setPrevTurn] = useState(-1)

    console.log({ gameOptions, gameState })

    // debug
    const myPlayerName = gameState?.players[gameState.turn % 4]?.name ?? ''
    console.log("Player name: " + myPlayerName)

    if (gameState && gameOptions) {
        if (prevTurn !== gameState.turn) {
            const game: ShanghaiGame = {
                state: gameState,
                options: gameOptions
            }

            const json = JSON.stringify(game)
            localStorage.setItem("game", json)
            setPrevTurn(gameState.turn)
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
        }, 200);
        return () => clearInterval(interval);
    }, []);

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

    console.log("render game view")
    return (
        <GameContext.Provider value={{
            myPlayerName,
            options: gameOptions,
            state: gameState,
            actionResponse,
            setActionResponse,
            selectedCard,
            setSelectedCard,
            hiddenCards,
            setHiddenCards
        }}>
            <GameView />
        </GameContext.Provider>
    )
}

export default Game
