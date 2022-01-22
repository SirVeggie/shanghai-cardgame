import style from './playerInfoCard.module.scss'
import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { GamePlayer } from 'shared'
import cx from 'classnames'

type Props = {
    player: GamePlayer
}

export const Playerinfocard = ({ player }: Props) => {
    const { myPlayerId, game: { state }, getPlayer, getCurrentPlayer } = useContext(GameContext)

    const isTurn = getCurrentPlayer().id === player.id
    const isMe = myPlayerId === player.id

    return <div className={cx(isMe && style.greenHighlight, style.card)}>

        <span className={style.text}>{isTurn && <span className={style.turnIndicator}>►</span>}{getPlayer(player.id).name}</span>
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