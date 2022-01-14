import style from './meldArea.module.scss'
import { useState } from 'react'
import { Meldsprivate } from './meldsPrivate'
import { Meldspublic } from './meldsPublic'

export const Meldarea = () => {
    const [myMelds, setMyMelds] = useState(true)

    return <div className={style.meldArea}>
        <button onClick={() => setMyMelds(prev => !prev)}>{myMelds ? 'Show public melds' : 'Show my melds'}</button>
        {myMelds ? <Meldsprivate /> : <Meldspublic />}
    </div>
}

