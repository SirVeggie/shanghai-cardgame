import style from './playingCard.module.scss'
import { Card } from "../shared"
import { PlayingCard } from "./playingCard"
import { ListIterator, Many, orderBy } from 'lodash'
import cx from 'classnames'

type HandProps = {
    cards: Card[]
    order?: Many<ListIterator<Card, unknown>>
    forceOriginalOrder?: boolean
    dummyCard?: boolean
    overrideOnClick?: (card: Card | undefined) => void
}


export const CardCollection = ({ cards: unorderedCards, order, forceOriginalOrder, dummyCard, overrideOnClick }: HandProps) => {
    let cards: (Card | undefined)[] = order ? orderBy(unorderedCards, order) : unorderedCards
    if (forceOriginalOrder) {
        cards = [...unorderedCards]
    }
    cards = dummyCard ? [undefined, ...cards] : cards

    const fan = {
        curve: 2,
        distance: 25,
        offset: 2,
        size: 150
    }
    
    return <div>
        <div className={cx(style.fanBase, 'cardFan')}>
            {cards.map(card => <PlayingCard
                card={card}
                overrideOnClick={overrideOnClick}
                fan={fan}
                key={`card-${card?.id ?? 'dummy'}`} />)}
        </div>
    </div>
}