import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { Card, MeldedMeld, Player } from '../shared'
import { CardCollection } from './cardCollection'
import { meldInfo } from './infoArea'
import style from './meldsPublic.module.scss'
import { actionAddToMeld } from './playerActions'
import { FanValues } from './playingCard'

export const Meldspublic = () => {
    const { state, options, setActionResponse, myPlayerName, selectedCard, hiddenCards, setHiddenCards } = useContext(GameContext)
    if (hiddenCards.length) {
        setHiddenCards([])
    }
    const round = options.rounds[state.roundNumber]

    const replaceJoker = (targetPlayer: string, meldIndex: number) => {
        const cardID = selectedCard.selectedCardID ?? selectedCard.actionHighlightCardID
        if (!cardID) {
            return
        }
        actionAddToMeld(setActionResponse, myPlayerName, {
            targetPlayer,
            targetMeldIndex: meldIndex,
            cardToMeldId: cardID,
            replaceJoker: true
        })
    }

    const meldRow = (owner: string, meld: MeldedMeld, meldIndex: number) => {
        const onClick = (card: Card | undefined) => {
            const cardID = selectedCard.selectedCardID ?? selectedCard.actionHighlightCardID
            if (!cardID) {
                return
            }
            const insertBehind = card ? true : false

            actionAddToMeld(setActionResponse, myPlayerName, ({
                targetPlayer: owner,
                targetMeldIndex: meldIndex,
                cardToMeldId: cardID,
                insertBehind
            }))
        }
        
        const fan: FanValues = {
            curve: 0.1,
            distance: 10,
            size: 100
        }
        
        const currentMeld = options.rounds[state.roundNumber].melds[meldIndex]
        const showJokerButton = currentMeld.type === 'straight' && meld.cards.some(x => x.rank === 25)

        return <div className={style.meldRow} style={{ position: 'relative' }}>
            {meldInfo({ meld: round.melds[meldIndex], meldIndex, noDiv: true })}
            <div className={style.buttons}>
                { showJokerButton ? <button onClick={() => replaceJoker(owner, meldIndex)}>Replace joker</button> : undefined }
            </div>
            <CardCollection cards={meld.cards} fan={fan} overrideOnClick={onClick} dummyCard={true} />
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

