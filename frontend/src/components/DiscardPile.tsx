import { MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import { SessionPublic } from 'shared';
import { DropInfo } from '../reducers/dropReducer';
import { PlayingCard } from './cards/PlayingCard';
import { Draggable } from './dragging/Draggable';
import { DropArea } from './dragging/DropArea';
import { Toggle } from './Toggle';
import cx from 'classnames';

type Props = {
  discard: SessionPublic['discard'];
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDrop?: (info: DropInfo) => void;
  size?: string | number;
  shanghai?: boolean;
  discarding?: boolean;
  drawing?: boolean;
};

export function DiscardPile(p: Props) {
  const s = useStyles();
  const info: DropInfo = {
    type: 'discard-card',
    data: p.discard.top,
  };

  return (
    <div>
      <div className={s.bottom}>
        <DropArea onDrop={p.onDrop}>
          <PlayingCard size={p.size} card={p.discard.bottom} onClick={p.onClick} />
        </DropArea>
      </div>
      <Toggle on={!p.discard.top}>
        <PlayingCard size={p.size} dummy />
      </Toggle>
      <Toggle on={!!p.discard.top}>
        <div className={cx(p.discarding && p.discard.top && s.discarding, p.drawing && s.drawing)}>
          <Draggable info={info}>
            <PlayingCard attention={p.shanghai} pointer hover size={p.size} card={p.discard.top} onClick={p.onClick} />
          </Draggable>
        </div>
      </Toggle>
    </div>
  );
}

const useStyles = createUseStyles({
  '@keyframes discarding': {
    '0%': {
      opacity: 0,
      transform: 'translateY(-100px)',
    },
    '50%': {
      opacity: 1,
    },
    '100%': {
      transform: 'translateY(0px)',
    },
  },
  
  '@keyframes drawing': {
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
  
  discarding: {
    animation: '$discarding 1s ease',
  },
  
  drawing: {
    animation: '$drawing 1s ease',
  },
});