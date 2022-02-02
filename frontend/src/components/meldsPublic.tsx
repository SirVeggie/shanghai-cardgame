import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { Card, MeldedMeld, GamePlayer } from 'shared'
import { CardCollection } from './cardCollection'
import { meldInfo } from './infoArea'
import style from './meldsPublic.module.scss'
import { actionAddToMeld } from './playerActions'
import { FanValues } from './playingCard'

export const Meldspublic = () => {
    const { game: { id: gameId, state, options }, setActionResponse, myPlayerId, getPlayer, selectedCard, setSelectedCard } = useContext(GameContext)
    const round = options.rounds[state.roundNumber]

    const replaceJoker = (targetPlayerId: number, meldIndex: number) => {
        const cardID = selectedCard.selectedCardID ?? selectedCard.actionHighlightCardID
        if (!cardID) {
            return
        }
        setSelectedCard(undefined)
        actionAddToMeld(setActionResponse, gameId, myPlayerId, {
            targetPlayerId,
            targetMeldIndex: meldIndex,
            cardToMeldId: cardID,
            replaceJoker: true
        })
    }

    const meldRow = (owner: number, meld: MeldedMeld, meldIndex: number) => {
        const onClick = (card: Card | undefined) => {
            const cardID = selectedCard.selectedCardID ?? selectedCard.actionHighlightCardID
            if (!cardID) {
                return
            }
            const insertBehind = card ? true : false

            setSelectedCard(undefined)
            actionAddToMeld(setActionResponse, gameId, myPlayerId, ({
                targetPlayerId: owner,
                targetMeldIndex: meldIndex,
                cardToMeldId: cardID,
                insertBehind
            }))
        }

        const fan: FanValues = {
            curve: 0.1,
            distance: 25,
            size: 100
        }

        const currentMeld = options.rounds[state.roundNumber].melds[meldIndex]
        const showJokerButton = currentMeld.type !== 'set' && meld.cards.some(x => x.rank === 25)

        return <div className={style.meldRow}>
            {meldInfo({ meld: round.melds[meldIndex], meldIndex, noDiv: true })}
            <CardCollection cards={meld.cards} fan={fan} overrideOnClick={onClick} dummyCard={true} />
            <div className={style.buttons}>
                {showJokerButton ? <button onClick={() => replaceJoker(owner, meldIndex)} style={{ marginTop: 5 }} >Replace joker</button> : undefined}
            </div>
        </div >
    }

    const myPlayerMelded = getPlayer(myPlayerId).melded.length > 0

    const playerRow = (player: GamePlayer) => {
        if (!myPlayerMelded && player.id === myPlayerId) {
            return
        }
        return <div className={style.playerRow}>
            <div>{getPlayer(player.id).name}</div>
            <div className={style.meldRowGroup}>
                {player.melded.map((m, i) => meldRow(player.id, m, i))}
            </div>
        </div>
    }

    return <div className={style.meldsPublic}>
        {state.players.map((pm: GamePlayer) => playerRow(pm))}
    </div>
}

