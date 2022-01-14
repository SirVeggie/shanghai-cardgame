import { useContext, useState } from 'react'
import { GameContext } from '../context/gameContext'
import { getPlayerByName, Meld, MeldAction, MeldCards } from '../shared'
import { CardCollection } from './cardCollection'
import { meldInfo } from './infoArea'
import style from './meldsPrivate.module.scss'
import { actionMeld } from './playerActions'

export const Meldsprivate = () => {
    const { state, options, selectedCard, setSelectedCard, myPlayerName, hiddenCards, setHiddenCards, setActionResponse } = useContext(GameContext)
    const requiredMelds = options.rounds[state.roundNumber].melds
    const myPlayer = getPlayerByName(state, myPlayerName)

    const [playerMelds, setPlayerMelds] = useState<MeldCards[]>(defaultMelds(requiredMelds.length))

    const getHidden = (playerMelds: MeldCards[]) => {
        const hidden: number[] = []
        playerMelds.forEach(meld => meld.cardIDs.forEach(id => hidden.push(id)))
        return hidden
    }

    const addCard = (index: number) => {
        if (!selectedCard) {
            return
        }
        const meldCards = [...playerMelds]
        if (meldCards[index].cardIDs.includes(selectedCard)) {
            return
        }
        setSelectedCard(undefined)
        setHiddenCards(hiddenCards.concat([selectedCard]))
        meldCards[index].cardIDs.push(selectedCard)
    }
    const clear = (index: number) => {
        const newMelds = playerMelds.map((meld, i) => index === i ? {
            cardIDs: []
        } : meld)
        setHiddenCards(getHidden(newMelds))
        setPlayerMelds(newMelds)
    }
    const onClickMeld = () => {
        actionMeld(setActionResponse, myPlayerName, { melds: playerMelds })
    }

    const meldRow = (meld: Meld, i: number) => {
        const meldCards = playerMelds[i]
        const cards = myPlayer.cards.filter(card => meldCards.cardIDs.includes(card.id))

        return <div className={style.meldRow}>
            {meldInfo({ meld, meldIndex: i, noDiv: true })}
            <div className={style.buttons}>
                <button onClick={() => addCard(i)}>Add card</button>
                <button onClick={() => clear(i)}>Clear</button>
            </div>
            <CardCollection cards={cards} size='normal' />
        </div >
    }

    const clearAll = () => {
        setPlayerMelds(defaultMelds(requiredMelds.length))
        setHiddenCards([])
    }

    return <div className={style.meldsPrivate}>
        <button onClick={onClickMeld}>Meld</button>
        <button onClick={clearAll}>Clear</button>
        {requiredMelds.map((meld, i) => meldRow(meld, i))}
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