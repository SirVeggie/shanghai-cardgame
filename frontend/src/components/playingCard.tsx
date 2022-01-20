import style from './playingCard.module.scss'
import cx from 'classnames'
import { Card, getPlayerByName } from "../shared"
import { CSSProperties, useContext, useState } from 'react'
import { GameContext } from '../context/gameContext'
import ctool from '../tools/CardTools'

type CardProps = {
    card?: Card
    fan?: FanValues
    noSelect?: boolean
    noMouse?: boolean
    overrideOnClick?: (card: Card | undefined) => void
};

type FaceProps = {
    card: Card
    isSelected: boolean
    fan?: FanValues
    noMouse?: boolean
    onClick: () => unknown
};

export type FanValues = {
    curve: number
    distance: number
    size?: number
    offset?: number
};

export type CardSize = 'large' | 'normal';

export const PlayingCard = ({ card, fan, noSelect, noMouse, overrideOnClick }: CardProps) => {
    const { selectedCard, setSelectedCard, state, myPlayerName } = useContext(GameContext)
    const myPlayer = getPlayerByName(state, myPlayerName)

    const backClick = () => {
        if (overrideOnClick) {
            overrideOnClick(undefined)
        }
    }

    if (!card) {
        return <CardBack onClick={backClick} noMouse={noMouse} />
    }

    const selectedCardID = selectedCard.selectedCardID ?? selectedCard.actionHighlightCardID

    const isSelected = !noSelect && selectedCardID === card.id
    const isProperSelected = card.id === selectedCard.selectedCardID

    const faceClick = () => {
        if (overrideOnClick) {
            overrideOnClick(card)
            return
        }
        if (isProperSelected) {
            setSelectedCard(undefined)
        } else {
            setSelectedCard(card.id)
        }
    }

    return <CardFace card={card} isSelected={isSelected} noMouse={noMouse} fan={fan} onClick={faceClick} />
}

const CardBack = ({ onClick, noMouse }: { onClick: () => unknown, noMouse?: boolean }) => {
    return <div className={cx(style.card, style.back, noMouse && style.noMouse)} onClick={onClick} />
}

const CardFace = ({ card, isSelected, noMouse, fan, onClick }: FaceProps) => {
    // const [follow, setFollow] = useState(false)
    const follow = false

    const isRed = ctool.color(card) === 'red'
    const dist = fan ? fan.distance / Math.sin(fan.curve * (Math.PI / 180)) * 2 : undefined
    const inline = fan ? {
        '--angle-amount': `${fan.curve}deg`,
        '--dist': `${dist}px`,
        '--offset-amount': fan.offset != undefined ? `${fan.offset}deg` : `${fan.curve / 2}deg`,
        '--size': fan?.size ? `${fan.size}px` : undefined
    } as CSSProperties : undefined

    return (
        <div className={cx(style.card, fan && style.fan, isRed && style.red, isSelected && style.selected, follow && style.follow, noMouse && style.noMouse)}
            style={inline}
            // onMouseDown={() => setFollow(true)}
            // onMouseUp={() => setFollow(false)}
            onClick={onClick}>
            <div>{ctool.rankPrefix(card)}</div>
            <div>{ctool.rankPrefix(card)}</div>
            <div>{ctool.suitIcon(card)}</div>
            <div>{ctool.suitIcon(card)}</div>
            <div>{ctool.suitIcon(card)}</div>
        </div >
    )
}
