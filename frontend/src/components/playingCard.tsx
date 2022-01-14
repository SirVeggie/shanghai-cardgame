import style from './playingCard.module.scss'
import cx from 'classnames'
import { Card, cardToString, CRank, rankToString, suitToString } from "../shared"
import { useContext } from 'react'
import { GameContext } from '../context/gameContext'


type CardProps = {
    card?: Card
    expanded?: Boolean
    overrideOnClick?: (card: Card | undefined) => void
    size: CardSize
}

type FaceProps = {
    name: string
    suit: string
    color: CardColor
    size: CardSize
}

export type CardSize = 'large' | 'normal'


type CardColor = 'red' | 'black'

export const PlayingCard = ({ card, expanded, overrideOnClick, size }: CardProps) => {
    const { selectedCard, setSelectedCard } = useContext(GameContext)

    const classSize = size === 'normal' ? style.normalCard : style.largeCard
    const classExpanded = size === 'normal' ? style.normalCardFull : style.largeCardFull

    if (!card) {
        return <div className={cx(style.playingCard, classSize, expanded && classExpanded)} onClick={() => {
            if (overrideOnClick) {
                overrideOnClick(undefined)
            }
        }}>
            <CardBack size={size} />
        </div>
    }

    const isSelected = selectedCard === card.id
    const color: CardColor = card.suit === 'heart' || card.suit === 'diamond' ? 'red' : 'black'

    return <div className={cx(style.playingCard, classSize, (expanded || isSelected) && classExpanded, isSelected && style.selected)} onClick={() => {
        if (overrideOnClick) {
            overrideOnClick(card)
            return
        }
        console.log('Select ' + cardToString(card))
        if (isSelected) {
            setSelectedCard(undefined)
        } else {
            setSelectedCard(card.id)
        }
    }}>
        <CardFace name={rankPrefix(card.rank)} suit={suitToString(card.suit)} color={color} size={size} />
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

const CardFace = ({ name, suit, color, size }: FaceProps) => {
    const sizeClass = size === 'normal' ? style.cardFaceNormal : style.cardFaceLarge
    return <div className={cx(style.cardFace, sizeClass, color == 'red' ? style.red : style.black)}>
        <div className={style.info}>
            <span className={style.text}>{name}</span>
            <span className={style.text}>{suit}</span>
        </div>
        <div className={style.suit}>
            <span className={style.text}>{suit}</span>
        </div>
    </div >
}

const CardBack = ({ size }: { size: CardSize }) => {
    const sizeClass = size === 'normal' ? style.cardFaceNormal : style.cardFaceLarge
    return <div className={cx(style.cardBack, sizeClass)}>
    </div >
}
