import style from './playingCard.module.scss'
import cx from 'classnames'
import { Card, cardToString, CRank, rankToString, suitToString } from "../shared"
import { useContext } from 'react'
import { GameContext } from '../context/gameContext'


type CardProps = {
    card?: Card
    expanded?: Boolean
}

type FaceProps = {
    name: string
    suit: string
    color: CardColor
}

type CardColor = 'red' | 'black'

type CardSize = "normal" | "covered"

export const PlayingCard = ({ card, expanded }: CardProps) => {
    const { setSelectedCard } = useContext(GameContext)

    if (!card) {
        return <div>
            Back of card
        </div>
    }

    const color: CardColor = card.suit === 'heart' || card.suit === 'diamond' ? 'red' : 'black'

    return <div className={cx(style.playingCard, expanded && style.fullSize)} onClick={() => {
        if (card) {
            console.log('Select ' + cardToString(card))
            setSelectedCard(card.id)
        }
    }}>
        <CardFace name={rankPrefix(card.rank)} suit={suitToString(card.suit)} color={color} />
    </div>
}

const rankPrefix = (rank: CRank) => {
    if (rank === 25) {
        return 'JOKER'
    }
    if (rank >= 11) {
        return rankToString(rank).substring(0, 1)
    }
    return rankToString(rank)
}

const CardFace = ({ name, suit, color }: FaceProps) => {
    return <div className={cx(style.cardFace, color == 'red' ? style.red : style.black)}>
        <div className={style.info}>
            <span className={style.text}>{name}</span>
            <span className={style.text}>{suit}</span>
        </div>
        <div className={style.suit}>
            <span className={style.text}>{suit}</span>
        </div>
    </div >
}

const getCardUrl = (card: Card) => `https://tekeye.uk/playing_cards/images/svg_playing_cards/fronts/clubs_ace.svg`