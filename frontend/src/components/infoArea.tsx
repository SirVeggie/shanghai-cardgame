import style from './infoArea.module.scss'
import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { Meld } from '../shared'

export const Infoarea = () => {

    const { game: { state, options } } = useContext(GameContext)

    if (state.roundNumber < 0) {
        return <span>Game not started</span>
    }

    const round = options.rounds[state.roundNumber]

    const headerText = state.winnerId !== undefined
        ? `${state.winnerId} wins!`
        : `Round ${state.roundNumber + 1} / ${options.rounds.length}`

    return <div className={style.infoArea}>
        <h1>{headerText}</h1>
        <h2>{round.description}</h2>

        <div className={style.melds}>
            {round.melds.map((meld, meldIndex) => meldInfo({ meld, meldIndex }))}
        </div>
    </div>
}

export const meldInfo = ({ meld, meldIndex, noDiv }: MeldProps) => {
    const meldType: MeldTypeStr = meld.type === 'set' ? {
        name: 'Set',
        sizeDesc: 'size'
    }
        : {
            name: 'Straight',
            sizeDesc: 'length'
        }

    const span = <span>
        Meld {meldIndex + 1}: {meldType.name} of {meldType.sizeDesc} {meld.length}
    </span>

    if (noDiv) {
        return span
    }

    return <div className={style.meld} key={`meld-desc-${meldIndex}`}>
        {span}
    </div>
}

type MeldTypeStr = {
    name: string
    sizeDesc: string
}

type MeldProps = {
    meldIndex: number
    meld: Meld
    noDiv?: boolean
}
