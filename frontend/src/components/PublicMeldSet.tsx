import { CSSProperties } from 'react';
import Draggable from 'react-draggable';
import { createUseStyles } from 'react-jss';
import { Card, findJokerSpot, Meld, MeldAdd, PlayerPublic } from 'shared';
import { DropInfo } from '../reducers/dropReducer';
import { CardFan } from './CardFan';
import { DropArea } from './dragging/DropArea';

type Props = {
  player: PlayerPublic;
  melds: Meld[];
  size: string;
  onDrop?: (info: DropInfo, player: PlayerPublic, index: number, position: MeldAdd['position']) => void;
};

export function PublicMeldSet(p: Props) {
  const s = useStyles();

  const size = p.size ?? '30px';
  const style = {
    '--size': size,
  } as CSSProperties;

  const onDrop = (index: number) => {
    return (info: DropInfo, position: MeldAdd['position']) => {
      p.onDrop?.(info, p.player, index, position);
    };
  };

  return (
    <Draggable>
      <div className={s.melds} style={style}>
        <span>{p.player.name}&apos;s melds</span>
        {p.melds.map((m, i) => (
          <MeldSet
            key={i}
            meld={m}
            size={p.size}
            onDrop={onDrop(i)}
          />
        ))}
      </div>
    </Draggable>
  );
}

type SetProps = {
  meld: Meld;
  size: string;
  onDrop?: (info: DropInfo, position: MeldAdd['position']) => void;
};

function MeldSet(p: SetProps) {
  const s = useStyles();

  const spacing = 3;
  const width = (p.meld.cards.length - 1) * (spacing + 0.2) + 5;
  const style = {
    '--width': p.meld.cards.length ? `${width}em` : '5em',
  } as CSSProperties;

  const onDrop = (info: DropInfo) => {
    if (!info.pos)
      return console.error('no position for drop');
    const card = info.data as Card;
    if (findJokerSpot(card, p.meld) !== -1) {
      p.onDrop?.(info, 'joker');
      
    } else if (info.pos.x < 0.5) {
      p.onDrop?.(info, 'start');
      
    } else if (info.pos.x >= 0.5) {
      p.onDrop?.(info, 'end');
    }
  };

  return (
    <DropArea onDrop={onDrop}>
      <div className={s.meld} style={style}>
        <CardFan noHover
          cards={p.meld.cards}
          size={p.size}
          spacing={spacing}
        />
      </div>
    </DropArea>
  );
}

const useStyles = createUseStyles({
  '@keyframes create': {
    from: {
      opacity: 0,
      transform: 'scale(0.9)',
    },

    to: {
      opacity: 1,
      transform: 'scale(1)',
    }
  },

  melds: {
    // pointerEvents: 'none',
    animation: '$create 1000ms ease',

    color: '#ddd',
    padding: '0 1em',
    backdropFilter: 'blur(3px)',
    border: '1px solid #fff1',
    borderRadius: '1em',

    '& > span': {
      fontSize: 'var(--size)',
    },
  },

  meld: {
    // pointerEvents: 'initial',
    fontSize: 'var(--size)',
    width: 'var(--width)',
    height: '8em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '0.5em',
  },
});