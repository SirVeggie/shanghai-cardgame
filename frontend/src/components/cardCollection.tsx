import style from './playingCard.module.scss'
import { Card } from "../shared"
import { FanValues, PlayingCard } from "./playingCard"
import { ListIterator, Many, orderBy } from 'lodash'
import cx from 'classnames'

type HandProps = {
    cards: Card[]
    order?: Many<ListIterator<Card, unknown>>
    forceOriginalOrder?: boolean
    dummyCard?: boolean
    fan?: FanValues
    overrideOnClick?: (card: Card | undefined) => void
};


export const CardCollection = ({ cards: unorderedCards, order, forceOriginalOrder, dummyCard, fan, overrideOnClick }: HandProps) => {
    let cards: (Card | undefined)[] = order ? orderBy(unorderedCards, order) : unorderedCards
    if (forceOriginalOrder) {
        cards = [...unorderedCards]
    }
    cards = dummyCard ? [undefined, ...cards] : cards

    return (
        <div style={{ overflow: 'hidden' }}>
            <div className={cx(style.fanBase, 'cardFan')}>
                {cards.map(card => <PlayingCard
                    card={card}
                    overrideOnClick={overrideOnClick}
                    fan={fan}
                    key={`card-${card?.id ?? 'dummy'}`} />)}
            </div>
        </div>
    )
}