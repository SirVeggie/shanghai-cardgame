import { createUseStyles } from 'react-jss';
import { Card } from 'shared';
import { PlayingCard } from './PlayingCard';

type Props = {
  cards: Card[];
};

export function CardFan(p: Props) {
  const s = useStyles();
  
  return (
    <div className={s.fan}>
      {p.cards.map(card => <PlayingCard key={card.id} card={card} />)}
    </div>
  );
}

const useStyles = createUseStyles({
  fan: {
    
  }
});