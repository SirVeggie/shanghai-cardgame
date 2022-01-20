import style from './playingCard.module.scss'
import { Card } from "../shared"
import { FanValues, PlayingCard } from "./playingCard"
import { ListIterator, Many, orderBy } from 'lodash'
import cx from 'classnames'
import { CSSProperties } from 'react'

type HandProps = {
    cards: Card[]
    order?: Many<ListIterator<Card, unknown>>
    forceOriginalOrder?: boolean
    dummyCard?: boolean
    fan?: FanValues
    allowCardSelect?: boolean
    overrideOnClick?: (card: Card | undefined) => void
};


export const CardCollection = ({ cards: unorderedCards, order, forceOriginalOrder, dummyCard, fan, allowCardSelect, overrideOnClick }: HandProps) => {
    let cards: (Card | undefined)[] = order ? orderBy(unorderedCards, order) : unorderedCards
    if (forceOriginalOrder) {
        cards = [...unorderedCards]
    }
    cards = dummyCard ? [undefined, ...cards] : cards

    const inline = fan?.size && cards.length ? {
        marginBottom: fan.size * 1.6 + 10
    } as CSSProperties : undefined

    return (
        <div style={{ overflow: 'hidden' }}>
            <div className={cx(style.fanBase, 'cardFan')} style={inline}>
                {cards.map(card => <PlayingCard
                    card={card}
                    overrideOnClick={overrideOnClick}
                    fan={fan}
                    noSelect={!allowCardSelect}
                    key={`card-${card?.id ?? 'dummy'}`} />)}
            </div>
        </div>
    )
}