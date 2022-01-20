import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import { Card, getCurrentPlayer } from '../shared'
import style from './deckArea.module.scss'
import { actionCallShanghai, actionTakeDeck, actionTakeDiscard } from './playerActions'
import { PlayingCard } from './playingCard'

export const Deckarea = () => {
    const { state, setActionResponse, myPlayerName } = useContext(GameContext)

    const clickDiscard = (card: Card | undefined) => {
        if (!card) {
            return
        }
        const currentPlayer = getCurrentPlayer(state)

        if (currentPlayer.name === myPlayerName) {
            actionTakeDiscard(setActionResponse, myPlayerName)
        } else {
            actionCallShanghai(setActionResponse, myPlayerName)
        }
    }

    const clickDeck = () => {
        actionTakeDeck(setActionResponse, myPlayerName)
    }

    const discardCard = state.discarded.length ? state.discarded[state.discarded.length - 1] : undefined
    const discardCardOld = state.discarded.length > 1 ? state.discarded[state.discarded.length - 2] : undefined

    return <div className={style.deckArea}>
        <CardContainer card={discardCard} hiddenCard={discardCardOld} onClick={clickDiscard} defaultCard='none' />
        <CardContainer onClick={clickDeck} defaultCard='back' />
    </div>
}

type Props = {
    card?: Card
    hiddenCard?: Card
    onClick: (card: Card | undefined) => void
    defaultCard: 'none' | 'back'
}

const CardContainer = ({ card, hiddenCard, onClick, defaultCard }: Props) => {
    const showDefaultCard = () => defaultCard === 'back' ? <PlayingCard card={undefined} noSelect /> : undefined
    const hidden = (card: Card | undefined) => <div className={style.hidden}><PlayingCard card={card} noSelect noMouse /></div>

    return <div className={style.cardContainer} onClick={() => onClick(card)}>
        {hiddenCard ? hidden(hiddenCard) : defaultCard === 'back' ? hidden(undefined) : undefined}
        {card ? <PlayingCard card={card} noSelect /> : showDefaultCard()}
    </div>
}
