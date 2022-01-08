import style from './playingCard.module.scss'
import cx from 'classnames'
import { Card } from "../shared"
import { CardFace } from './cardFace'

type CardProps = {
    card: Card
}

type CardSize = "normal" | "covered"

export const PlayingCard = ({ card }: CardProps) => {

    return <div className={style.playingCard}>
        <CardFace card={card} />
    </div>
}

const getCardUrl = (card: Card) => `https://tekeye.uk/playing_cards/images/svg_playing_cards/fronts/clubs_ace.svg`