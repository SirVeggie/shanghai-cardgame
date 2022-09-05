import { MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import { SessionPublic } from 'shared';
import { DropInfo } from '../reducers/dropReducer';
import { PlayingCard } from './cards/PlayingCard';
import { Draggable } from './dragging/Draggable';
import { DropArea } from './dragging/DropArea';
import { Toggle } from './Toggle';

type Props = {
  discard: SessionPublic['discard'];
  onClick?: MouseEventHandler<HTMLDivElement>;
  onDrop?: (info: DropInfo) => void;
};

export function DiscardPile(p: Props) {
  const s = useStyles();
  const info: DropInfo = {
    type: 'discard-card',
    data: p.discard.top,
  };

  const onDrop = (info: DropInfo) => {
    console.log(`info: ${info.type}`);
    if (info.type !== 'hand-card')
      return;
    p.onDrop?.(info);
  };

  return (
    <div className={s.base}>
      <div className={s.bottom}>
        <DropArea onDrop={onDrop}>
          <PlayingCard card={p.discard.bottom} onClick={p.onClick} />
        </DropArea>
      </div>
      <Toggle on={!!p.discard.top}>
        <Draggable info={info}>
          <PlayingCard pointer hover card={p.discard.top} onClick={p.onClick} />
        </Draggable>
      </Toggle>
    </div>
  );
}

const useStyles = createUseStyles({
  base: {
    '&:active, &:hover': {
      zIndex: 1,
    },
  },

  bottom: {
    position: 'absolute',
  }
});