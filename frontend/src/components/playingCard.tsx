import style from './playingCard.module.scss'
import cx from 'classnames'
import { Card, CColor } from "../shared"
import { useContext } from 'react'
import { GameContext } from '../context/gameContext'
import cards from '../tools/CardTools';

type CardProps = {
    card?: Card
    expanded?: boolean
    overrideOnClick?: (card: Card | undefined) => void
    size: CardSize
}

type FaceProps = {
    name: string
    suit: string
    color: CColor
    size: CardSize
}

export type CardSize = 'large' | 'normal'

export const PlayingCard = ({ card, expanded, overrideOnClick, size: sizeParam }: CardProps) => {
    const { selectedCard, setSelectedCard, smallTheme } = useContext(GameContext)

    const size = smallTheme ? 'normal' : sizeParam

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

    return <div className={cx(style.playingCard, classSize, (expanded || isSelected) && classExpanded, isSelected && style.selected)} onClick={() => {
        if (overrideOnClick) {
            overrideOnClick(card)
            return
        }
        console.log('Select ' + cards.longName(card))
        if (isSelected) {
            setSelectedCard(undefined)
        } else {
            setSelectedCard(card.id)
        }
    }}>
        <CardFace name={cards.rankPrefix(card)} suit={cards.suitName(card)} color={cards.color(card)} size={size} />
    </div>
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
