import { Deckarea } from './deckArea'
import style from './gameView.module.scss'
import { Infoarea } from './infoArea'
import { Meldarea } from './meldArea'
import { Playerlist } from './playerList'
import { PlayerTable } from './playerTable'

export const GameView = () => {
    console.log("Game view")
    return <div>
        <div className={style.mainArea}>
            <div className={style.publicTable}>
                <div className={style.meldArea}>
                    <Meldarea />
                </div>

                <div className={style.stateArea}>
                    <div className={style.gameInfo}>
                        <div className={style.playerList}>
                            <Playerlist />
                        </div>
                        <div className={style.infoArea}>
                            <Infoarea />
                        </div>
                    </div>
                    <div className={style.deckArea}>
                        <Deckarea />
                    </div>
                </div>



            </div>
            <div className={style.playerTable}>
                <PlayerTable />
            </div>
        </div>
    </div>
}
