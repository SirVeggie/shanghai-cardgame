import { MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import { Card, ctool } from 'shared';

type Props = {
  card: Card;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function PlayingCard(p: Props) {
  const s = useStyles();
  
  return (
    <div className={s.card} onClick={p.onClick}>
      <i>{ctool.suitIcon(p.card)}</i>
      <i>{ctool.suitIcon(p.card)}</i>
      <i>{ctool.suitIcon(p.card)}</i>
      <span>{ctool.rankPrefix(p.card)}</span>
      <span>{ctool.rankPrefix(p.card)}</span>
    </div>
  );
}

const useStyles = createUseStyles({
  card: {
    
  }
});