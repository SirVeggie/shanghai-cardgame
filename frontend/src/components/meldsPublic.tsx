import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { Card, MeldCards, MeldedMeld, Player } from '../shared'
import { CardCollection } from './cardCollection'
import { meldInfo } from './infoArea'
import style from './meldsPublic.module.scss'
import { actionAddToMeld } from './playerActions'

type PlayerTableMeld = {
    player: string
    meld: MeldedMeld[]
}

type TargetMeld = {
    player: string
    meld: MeldedMeld
    meldIndex: number
}

export const Meldspublic = () => {
    const { state, options, setActionResponse, myPlayerName, selectedCard, hiddenCards, setHiddenCards } = useContext(GameContext)
    if (hiddenCards.length) {
        setHiddenCards([])
    }
    const round = options.rounds[state.roundNumber]

    const replaceJoker = (targetPlayer: string, meldIndex: number) => {
        if (!selectedCard) {
            return
        }
        actionAddToMeld(setActionResponse, myPlayerName, {
            targetPlayer,
            targetMeldIndex: meldIndex,
            cardToMeldId: selectedCard,
            replaceJoker: true
        })
    }

    const meldRow = (owner: string, meld: MeldedMeld, meldIndex: number) => {
        const onClick = (card: Card | undefined) => {
            if (!selectedCard) {
                return
            }
            const insertBehind = card ? true : false

            actionAddToMeld(setActionResponse, myPlayerName, ({
                targetPlayer: owner,
                targetMeldIndex: meldIndex,
                cardToMeldId: selectedCard,
                insertBehind
            }))
        }

        return <div className={style.meldRow}>
            {meldInfo({ meld: round.melds[meldIndex], meldIndex, noDiv: true })}
            <div className={style.buttons}>
                <button onClick={() => replaceJoker(owner, meldIndex)}>Replace joker</button>
            </div>
            <CardCollection cards={meld.cards} overrideOnClick={onClick} dummyCard={true} />
        </div >
    }

    const playerRow = (player: Player, index: number) => {
        return <div className={style.playerRow}>
            <span>{player.name}</span>
            {player.melded.map((m, i) => meldRow(player.name, m, i))}
        </div>
    }

    return <div className={style.meldsPublic}>
        {state.players.map((pm, i) => playerRow(pm, i))}
    </div>
}

