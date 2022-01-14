import style from './infoArea.module.scss'
import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { Meld } from '../shared'

export const Infoarea = () => {

    const { state, options } = useContext(GameContext)

    const round = options.rounds[state.roundNumber]

    const headerText = state.winner
        ? `${state.winner} wins!`
        : `Round ${state.roundNumber + 1} / ${options.rounds.length}`

    return <div className={style.infoArea}>
        <h1>{headerText}</h1>
        <h2>{round.description}</h2>

        <div className={style.melds}>
            {round.melds.map((meld, meldIndex) => meldInfo({ meld, meldIndex }))}
        </div>
    </div>
}

const meldInfo = ({ meld, meldIndex }: MeldProps) => {
    const meldType: MeldTypeStr = meld.type === 'set' ? {
        name: 'Set',
        sizeDesc: 'size'
    }
        : {
            name: 'Straight',
            sizeDesc: 'length'
        }

    return <div className={style.meld} key={`meld-desc-${meldIndex}`}>
        <span>
            Meld {meldIndex + 1}: {meldType.name} of {meldType.sizeDesc} {meld.length}
        </span>
    </div>
}

type MeldTypeStr = {
    name: string
    sizeDesc: string
}

type MeldProps = {
    meldIndex: number
    meld: Meld
}
