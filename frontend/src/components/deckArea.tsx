import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { Card } from '../shared'
import style from './deckArea.module.scss'
import { actionTakeDeck, actionTakeDiscard } from './playerActions'
import { PlayingCard } from './playingCard'

export const Deckarea = () => {
    const { state, setActionResponse, myPlayerName } = useContext(GameContext)

    const clickDiscard = (card: Card | undefined) => {
        if (!card) {
            return
        }
        actionTakeDiscard(setActionResponse, myPlayerName)
    }

    const clickDeck = (card: Card | undefined) => {
        actionTakeDeck(setActionResponse, myPlayerName)
    }

    const discardCard = state.discarded.length ? state.discarded[state.discarded.length - 1] : undefined

    return <div className={style.deckArea}>
        <CardContainer card={discardCard} onClick={clickDiscard} defaultCard='none' />
        <CardContainer onClick={clickDeck} defaultCard='back' />
    </div>
}

type Props = {
    card?: Card
    onClick: (card: Card | undefined) => void
    defaultCard: 'none' | 'back'
}

const CardContainer = ({ card, onClick, defaultCard }: Props) => {
    const showDefaultCard = () => defaultCard === 'back' ? <PlayingCard card={undefined} /> : null
    return <div className={style.cardContainer} onClick={() => onClick(card)}>
        {card ? <PlayingCard card={card} /> : showDefaultCard()}
    </div>
}
