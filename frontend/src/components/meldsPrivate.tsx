import { useContext, useState } from 'react'
import { GameContext } from '../context/gameContext'
import { Card, Meld, MeldCards } from '../shared'
import { CardCollection, fanWidthCalc } from './cardCollection'
import { meldInfo } from './infoArea'
import style from './meldsPrivate.module.scss'
import { actionMeld } from './playerActions'
import cx from 'classnames'
import { compact } from 'lodash'
import { FanValues } from './playingCard'

export const Meldsprivate = () => {
    const { game: { id: gameId, state, options }, selectedCard, setSelectedCard, myPlayerId, getPlayer, hiddenCards, setHiddenCards, setActionResponse } = useContext(GameContext)
    const requiredMelds = options.rounds[state.roundNumber].melds
    const myPlayer = getPlayer(myPlayerId)

    const [playerMelds, setPlayerMelds] = useState<MeldCards[]>(defaultMelds(requiredMelds.length))
    const [activeMeld, setActiveMeld] = useState<number>()

    const getHidden = (playerMelds: MeldCards[]) => {
        const hidden: number[] = []
        playerMelds.forEach(meld => meld.cardIDs.forEach(id => hidden.push(id)))
        return hidden
    }

    const addCard = (index: number, cardID: number) => {
        const meldCards = [...playerMelds]
        if (meldCards[index].cardIDs.includes(cardID)) {
            return
        }
        setSelectedCard(undefined)
        setHiddenCards(hiddenCards.concat([cardID]))
        meldCards[index].cardIDs.push(cardID)
    }

    const startAdding = (index: number) => {
        setSelectedCard(undefined)
        if (activeMeld === index) {
            setActiveMeld(undefined)
        } else {
            setActiveMeld(index)
        }
    }

    const clear = (index: number) => {
        const newMelds = playerMelds.map((meld, i) => index === i ? {
            cardIDs: []
        } : meld)
        setHiddenCards(getHidden(newMelds))
        setPlayerMelds(newMelds)
    }
    const onClickMeld = () => {
        actionMeld(setActionResponse, gameId, myPlayerId, { melds: playerMelds })
    }

    const meldRow = (meld: Meld, i: number) => {
        const meldCards = playerMelds[i]
        const cards = compact(meldCards.cardIDs.map(id => myPlayer.cards.find(c => c.id === id)))

        const fan: FanValues = {
            curve: 0.1,
            distance: 25,
            size: 100
        }

        const clickCard = (card: Card | undefined) => {
            if (!card) {
                return
            }

            const newMeldCards = [...playerMelds]
            newMeldCards[i].cardIDs = newMeldCards[i].cardIDs.filter(id => id !== card.id)
            const newHiddenCards = hiddenCards.filter(id => id !== card.id)

            setPlayerMelds(newMeldCards)
            setHiddenCards(newHiddenCards)
        }

        return <div className={style.meldRow} style={{ minWidth: fanWidthCalc(4, fan) }}>
            {meldInfo({ meld, meldIndex: i, noDiv: true })}
            <div className={style.buttons}>
                <button className={cx(activeMeld === i && style.greenHighlight)} onClick={() => startAdding(i)}>Add cards</button>
                <button onClick={() => clear(i)}>Clear</button>
            </div>
            <div className={style.cardsInner}>
                <CardCollection cards={cards} fan={fan} forceOriginalOrder={true} overrideOnClick={clickCard} />
            </div>
        </div >
    }

    const clearAll = () => {
        setPlayerMelds(defaultMelds(requiredMelds.length))
        setHiddenCards([])
    }

    if (activeMeld !== undefined && selectedCard.selectedCardID) {
        addCard(activeMeld, selectedCard.selectedCardID)
    }

    return <div className={style.meldsPrivate}>
        <button onClick={onClickMeld}>Meld</button>
        <button onClick={clearAll}>Clear</button>
        <div className={style.meldRowGroup}>
            {requiredMelds.map((meld, i) => meldRow(meld, i))}
        </div>
    </div>
}

const defaultMelds = (meldCount: number) => {
    const melds: MeldCards[] = []
    for (let i = 0; i < meldCount; i++) {
        melds.push({
            cardIDs: []
        })
    }
    return melds
}