import { CSSProperties } from 'react';
import { createUseStyles } from 'react-jss';
import { Card } from 'shared';
import { DropInfo } from '../reducers/dropReducer';
import { CardFan } from './CardFan';
import { DropArea } from './dragging/DropArea';
import { Reposition } from './Reposition';

type Props = {
  cards: Card[];
  newCards: Card[];
  onDrop?: (info: DropInfo) => void;
};

export function Hand(p: Props) {
  const s = useStyles();

  const fan = {
    angle: 3 / (p.cards.length * 0.1),
    size: 'min(min(2vw, 5vh), 30px)',
    spacing: Math.min(3, 3 / (p.cards.length * 0.08)),
  };

  const width = (p.cards.length - 1) * fan.spacing + 5;
  const style = {
    '--size': fan.size,
    '--width': `${width}em`,
  } as CSSProperties;

  const onDrop = (info: DropInfo) => {
    if (info.layer === 0) {
      const x = info.pos!.x < 0.5 ? 0 : 1;
      p.onDrop?.({ ...info, pos: { y: info.pos!.y, x } });
    }
  };

  const onInnerDrop = (info: DropInfo) => {
    p.onDrop?.(info);
  };

  return (
    <div className={s.hand} style={style}>
      <Reposition size={fan.size} handleOffset={{ x: '0.3em', y: '0.3em' }}>
        <DropArea className={s.handDrop} onDrop={onDrop}>
          <DropArea className={s.dropInner} onDrop={onInnerDrop}>
            <div className='inner'>
              <CardFan
                {...fan}
                drag
                cards={p.cards}
                newCards={p.newCards}
                cardType='hand-card'
              />
            </div>
          </DropArea>
        </DropArea>
      </Reposition>
    </div>
  );
}

const useStyles = createUseStyles({
  hand: {
    position: 'fixed',
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: 'calc(100vh - var(--size) * 7)',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,

    '& .inner > div': {
      pointerEvents: 'initial',
    },
  },

  handDrop: {
    fontSize: 'var(--size)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '8em',
    width: 'calc(var(--width) + 5em)',
  },
  
  dropInner: {
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 'var(--size)',
    width: 'var(--width)',
    height: '8em',

    '& > div': {
      position: 'absolute',
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
  },
});