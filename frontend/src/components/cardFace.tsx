import { Card, cardToString } from "../shared"

type CardProps = {
    card: Card
}

export const CardFace = ({ card }: CardProps) => {
    return <div>
        {cardToString(card)}
    </div>
}