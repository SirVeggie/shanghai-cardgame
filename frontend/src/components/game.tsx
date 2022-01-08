import { useEffect, useState } from "react"
import { ShanghaiOptions, ShanghaiState } from "../../.."
import { GameContext } from "../context/gameContext"
import { getGameOptions, getGameState } from "../services/gameApi"
import { GameView } from "./gameView"
import { NameInput } from "./nameInput"

// dumb but ez solution
let updateInProgress = false

const Game = () => {
    const [myPlayerName, setMyPlayerName] = useState<string>()
    const [gameOptions, setGameOptions] = useState<ShanghaiOptions>()
    const [gameState, setGameState] = useState<ShanghaiState>()

    console.log("Player name: " + myPlayerName)

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

    if (!myPlayerName) {
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

    return (
        <GameContext.Provider value={{
            myPlayerName,
            options: gameOptions,
            state: gameState
        }}>
            <GameView />
        </GameContext.Provider>
    )
}

export default Game
