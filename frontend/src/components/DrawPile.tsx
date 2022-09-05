import { MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import { GameEvent } from 'shared';
import { DropInfo } from '../reducers/dropReducer';
import { PlayingCard } from './cards/PlayingCard';
import { Draggable } from './dragging/Draggable';
import { Toggle } from './Toggle';

type Props = {
  amount: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDrop?: (event: GameEvent) => void;
};

export function DrawPile(p: Props) {
  const s = useStyles();
  const info: DropInfo = {
    type: 'deck-card',
  };

  return (
    <div className={s.base}>
      <div className={s.bottom}>
        <PlayingCard back={p.amount > 1} />
      </div>
      <Toggle on={p.amount > 0}>
        <Draggable info={info}>
          <PlayingCard pointer hover back onClick={p.onClick} />
        </Draggable>
      </Toggle>
    </div>
  );
}

const useStyles = createUseStyles({
  base: {
    '&:active, &:hover, &.dragging': {
      zIndex: 1,
    },
  },

  bottom: {
    position: 'absolute',
  }
});