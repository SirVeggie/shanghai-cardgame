import { MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import { GameEvent } from 'shared';
import { DropInfo } from '../reducers/dropReducer';
import { PlayingCard } from './cards/PlayingCard';
import { Draggable } from './dragging/Draggable';
import { Toggle } from './Toggle';
import cx from 'classnames';

type Props = {
  amount: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDrop?: (event: GameEvent) => void;
  size?: string | number;
  drawing?: boolean;
};

export function DrawPile(p: Props) {
  const s = useStyles();
  const info: DropInfo = {
    type: 'deck-card',
  };

  return (
    <div>
      <div className={s.bottom}>
        <PlayingCard size={p.size} back={p.amount > 1} />
      </div>
      <Toggle on={p.amount > 0}>
        <div className={cx(p.drawing && s.draw)}>
          <Draggable info={info}>
            <PlayingCard pointer hover size={p.size} back onClick={p.onClick} />
          </Draggable>
        </div>
      </Toggle>
    </div>
  );
}

const useStyles = createUseStyles({
  '@keyframes draw': {
    '0%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      opacity: 1,
    },
    '100%': {
      opacity: 0,
      transform: 'translateY(-100px)',
    },
  },
  
  bottom: {
    position: 'absolute',
  },
  
  draw: {
    animation: '$draw 1s ease',
  },
});