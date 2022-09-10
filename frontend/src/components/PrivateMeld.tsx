import { CSSProperties } from 'react';
import { createUseStyles } from 'react-jss';
import { Card } from 'shared';
import { DropInfo } from '../reducers/dropReducer';
import { CardFan } from './CardFan';
import { EmptyCard } from './cards/EmptyCard';
import { DropArea } from './dragging/DropArea';
import { Reposition } from './Reposition';
import { Toggle } from './Toggle';
import cx from 'classnames';

export type PrivateMeld = {
  id: string;
  cards: Card[];
}

type Props = {
  meld: PrivateMeld;
  size?: string;
  onDrop?: (info: DropInfo) => void;
  style?: CSSProperties;
  className?: string;
};

export function PrivateMeld(p: Props) {
  const s = useStyles();

  const size = p.size ?? '30px';
  const spacing = 3;
  const width = (p.meld.cards.length - 1) * (spacing + 0.2) + 5;
  const style = {
    ...p.style,
    '--size': size,
    '--width': p.meld.cards.length ? `${width}em` : '5em',
  } as CSSProperties;

  return (
    <div className={cx(s.shrink, p.className)} style={style}>
      <Reposition>
        <DropArea onDrop={p.onDrop}>
          <div className={s.base} style={style}>
            <Toggle on={!p.meld.cards.length}>
              <EmptyCard size={size} className='repositionHandle' />
            </Toggle>

            <Toggle on={!!p.meld.cards.length}>
              <CardFan drag
                cards={p.meld.cards}
                size={size}
                spacing={spacing}
                cardType='meld-card'
              />
            </Toggle>
          </div>
        </DropArea>
      </Reposition>
    </div>
  );
}

const useStyles = createUseStyles({
  shrink: {
    position: 'absolute',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
  },
  
  base: {
    fontSize: 'var(--size)',
    width: 'var(--width)',
    height: '8em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'initial',
    transition: 'width 500ms ease',
  }
});