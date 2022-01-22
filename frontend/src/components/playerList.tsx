import { orderBy } from 'lodash'
import style from './playerList.module.scss'
import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { LabelCard, Playerinfocard } from './playerInfoCard'

export const Playerlist = () => {
    const { game: { state }, getPlayer } = useContext(GameContext)
    return <div className={style.status}>
        {Boolean(state.message) && <span className={style.message}>{state.message}</span>}
        {state.shanghaiForId !== undefined && <span className={style.message}>{getPlayer(state.shanghaiForId).id} called Shanghai!</span>}
        <div className={style.list}>
            <LabelCard />
            {state.players.map((p, i) =>
                <Playerinfocard player={p} key={`player-${i}`} />
            )}
        </div>
    </div>

}

