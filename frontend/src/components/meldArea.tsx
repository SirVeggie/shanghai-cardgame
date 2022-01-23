import style from './meldArea.module.scss'
import { useContext, useState } from 'react'
import { Meldsprivate } from './meldsPrivate'
import { Meldspublic } from './meldsPublic'
import { GameContext } from '../context/gameContext'

export const Meldarea = () => {
    const { myPlayerId, getPlayer, hiddenCards, setHiddenCards } = useContext(GameContext)

    const myPlayerMelded = getPlayer(myPlayerId).melded.length > 0

    if (myPlayerMelded && hiddenCards.length > 0) {
        setHiddenCards([])
    }

    return <div className={style.meldArea}>
        {!myPlayerMelded && <Meldsprivate />}
        <Meldspublic />
    </div>
}

