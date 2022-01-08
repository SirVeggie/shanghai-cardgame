import style from './playerInfoCard.module.scss'
import { useContext, useState } from 'react'
import { GameContext } from '../context/gameContext'
import { getCurrentPlayer, Player } from '../shared'
import cx from 'classnames'

type Props = {
    player: Player
}

export const Playerinfocard = ({ player }: Props) => {
    const { myPlayerName, state } = useContext(GameContext)

    const isTurn = getCurrentPlayer(state).name === player.name
    const isMe = myPlayerName === player.name

    return <div className={cx(isTurn && style.greenHighlight, !isTurn && isMe && style.greyHighlight, style.card)}>
        <span className={style.text}>{player.name}</span>
        <span className={style.text}>{player.cards.length}</span>
        <span className={style.text}>{player.shanghaiCount}</span>
        <span className={style.text}>{player.points}</span>
    </div>
}

export const LabelCard = () => {
    return <div className={cx(style.card)}>
        <span className={style.text}>Name</span>
        <span className={style.text}>Card count</span>
        <span className={style.text}>Shanghais used</span>
        <span className={style.text}>Score</span>
    </div>
}