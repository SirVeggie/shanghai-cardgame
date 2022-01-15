import style from './cardCollection.module.scss'
import { Card } from "../shared"
import { CardSize, PlayingCard } from "./playingCard"
import { ListIterator, Many, orderBy } from 'lodash'

type HandProps = {
    cards: Card[]
    size: CardSize
    order?: Many<ListIterator<Card, unknown>>
    forceOriginalOrder?: boolean
    dummyCard?: boolean
    overrideOnClick?: (card: Card | undefined) => void
}


export const CardCollection = ({ cards: unorderedCards, order, forceOriginalOrder, size, dummyCard, overrideOnClick }: HandProps) => {
    let cards: (Card | undefined)[] = order ? orderBy(unorderedCards, order) : unorderedCards
    if (forceOriginalOrder) {
        cards = [...unorderedCards]
    }
    cards = dummyCard ? [undefined, ...cards] : cards

    return <div>
        <div className={style.cardRow}>
            {cards.map((card, index) => <PlayingCard
                card={card}
                expanded={index === cards.length - 1}
                overrideOnClick={overrideOnClick}
                size={size}
                key={`card-${card?.id ?? 'dummy'}`} />)}
        </div>
    </div>
}