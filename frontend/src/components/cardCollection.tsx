import style from './cardCollection.module.scss'
import { Card } from "../shared"
import { PlayingCard } from "./playingCard"
import { ListIterator, Many, orderBy } from 'lodash'

type HandProps = {
    cards: Card[]
    order?: Many<ListIterator<Card, unknown>>
}

export const CardCollection = ({ cards: unorderedCards, order }: HandProps) => {
    const cards = order ? orderBy(unorderedCards, order) : unorderedCards

    return <div>
        <div className={style.cardRow}>
            {cards.map((card, index) => <PlayingCard card={card} expanded={index === cards.length - 1} key={`card-${card.id}`} />)}
        </div>
    </div>
}