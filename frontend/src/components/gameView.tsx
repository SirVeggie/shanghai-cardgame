import style from './gameView.module.scss'
import { useContext } from "react"
import { GameContext } from "../context/gameContext"
import { CardCollection } from "./cardCollection"
import { PlayingCard } from "./playingCard"
import { PlayerTable } from './playerTable'

export const GameView = () => {

   

    console.log("Game view")
    return <div>
        <div className={style.mainArea}>
            <div className={style.tableArea}>
                <div className={style.publicTable}>
                    Public table
                </div>
                <div className={style.playerTable}>
                    <PlayerTable />
                </div>
            </div>
            <div className={style.infoArea}>
                Info area
            </div>
        </div>
        
    </div>
}
