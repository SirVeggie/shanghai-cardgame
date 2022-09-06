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
  size?: string | number;
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
        <Draggable info={info}>
          <PlayingCard pointer hover size={p.size} card={p.discard.top} onClick={p.onClick} />
        </Draggable>
      </Toggle>
    </div>
  );
}

const useStyles = createUseStyles({
  bottom: {
    position: 'absolute',
  }
});