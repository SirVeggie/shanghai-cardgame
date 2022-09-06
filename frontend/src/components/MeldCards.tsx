import { CSSProperties } from 'react';
import { createUseStyles } from 'react-jss';
import { Meld, PlayerPublic } from 'shared';
import { CardFan } from './CardFan';

type Props = {
  meld: Meld;
  player: PlayerPublic;
  size?: string | number;
};

export function MeldCards(p: Props) {
  const s = useStyles();
  
  const size = p.size ?? '10px';
  const width = (p.meld.cards.length - 1) * 3.2 + 5;
  const style = {
    '--size': size,
    '--width': `${width}em`,
  } as CSSProperties;
  
  return (
    <div className={s.base} style={style}>
      <span>{p.player.name}: {p.meld.config.type} of {p.meld.config.length}</span>
      <CardFan size={size} cards={p.meld.cards} />
    </div>
  );
}

const useStyles = createUseStyles({
  base: {
    position: 'relative',
    fontSize: 'var(--size)',
    width: 'var(--width)',
    height: '8em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
    '& > span': {
      position: 'absolute',
      fontSize: '1.5em',
      color: '#ccc',
      // width: '100px',
      // height: '100px',
      left: 0,
      bottom: '-1.7em',
      backgroundColor: '#0005',
      padding: '2em 0.5em 0.2em 0.5em',
      border: '2px solid #0005',
      borderRadius: '0 0 0.2em 0.2em',
      backdropFilter: 'blur(3px)',
    },
  },
});