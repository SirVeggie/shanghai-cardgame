import { orderBy } from 'lodash'
import style from './playerList.module.scss'
import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { LabelCard, Playerinfocard } from './playerInfoCard'

export const Playerlist = () => {
    const { state } = useContext(GameContext)
    return <div className={style.list}>
        <LabelCard />
        {state.players.map((p, i) =>
            <Playerinfocard player={p} key={`player-${i}`} />
        )}
    </div>
}

