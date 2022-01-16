import style from './playingCard.module.scss'
import cx from 'classnames'
import { Card } from "../shared"
import { CSSProperties, useContext, useState } from 'react'
import { GameContext } from '../context/gameContext'
import ctool from '../tools/CardTools'

type CardProps = {
    card?: Card;
    fan?: FanValues;
    overrideOnClick?: (card: Card | undefined) => void;
};

type FaceProps = {
    card: Card,
    isSelected: boolean,
    fan?: FanValues,
    onClick: () => unknown;
};

type FanValues = {
    curve: number,
    distance: number,
    size?: number,
    offset?: number;
};

export type CardSize = 'large' | 'normal';

export const PlayingCard = ({ card, fan, overrideOnClick }: CardProps) => {
    const { selectedCard, setSelectedCard } = useContext(GameContext)

    const backClick = () => {
        if (overrideOnClick) {
            overrideOnClick(undefined)
        }
    }

    if (!card) {
        return <CardBack onClick={backClick} />
    }

    const isSelected = selectedCard === card.id

    const faceClick = () => {
        if (overrideOnClick) {
            overrideOnClick(card)
            return
        }
        console.log('Select ' + ctool.longName(card))
        if (isSelected) {
            setSelectedCard(undefined)
        } else {
            setSelectedCard(card.id)
        }
    }

    return <CardFace card={card} isSelected={isSelected} fan={fan} onClick={faceClick} />
}

const CardFace = ({ card, isSelected, fan, onClick }: FaceProps) => {
    const [follow, setFollow] = useState(false)

    const isRed = ctool.color(card) === 'red'
    const dist = fan ? fan.distance / Math.sin(fan.curve * (Math.PI / 180)) * 2 : undefined
    const inline = fan ? {
        '--angle-amount': `${fan.curve}deg`,
        '--dist': `${dist}px`,
        '--offset-amount': fan.offset ? `${fan.offset}deg` : `${fan.curve / 2}deg`,
        '--size': fan?.size ? `${fan.size}px` : undefined
    } as CSSProperties : undefined

    return (
        <div className={cx(style.card, fan && style.fan, isRed && style.red, isSelected && style.selected, follow && style.follow)}
            style={inline}
            onClick={onClick}
            onMouseDown={() => setFollow(true)}
            onMouseUp={() => setFollow(false)}>
            <div>{ctool.rankPrefix(card)}</div>
            <div>{ctool.suitIcon(card)}</div>
            <div>{ctool.suitIcon(card)}</div>
            <div>{ctool.suitIcon(card)}</div>
        </div >
    )
}

const CardBack = ({ onClick }: { onClick: () => unknown; }) => {
    return <div className={cx(style.card, style.back)} onClick={onClick} />
}
