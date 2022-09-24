import { CSSProperties, MouseEventHandler } from 'react';
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
  onAllowShanghai?: () => void;
  size?: string | number;
  shanghai?: boolean;
  discarding?: boolean;
  drawing?: boolean;
  showButton?: boolean;
};

export function DiscardPile(p: Props) {
  const s = useStyles();
  const info: DropInfo = {
    type: 'discard-card',
    data: p.discard.top,
  };

  const style = {
    '--size': p.size,
  } as CSSProperties;

  return (
    <div className={s.base}>
      <div className={s.bottom}>
        <DropArea onDrop={p.onDrop}>
          <PlayingCard size={p.size} card={p.discard.bottom} onClick={p.onClick} />
        </DropArea>
      </div>
      <Toggle on={!p.discard.top}>
        <PlayingCard size={p.size} dummy />
      </Toggle>
      <Toggle on={!!p.discard.top}>
        <div className={cx(s.shanghaiButton, p.showButton && 'show')} onClick={p.onAllowShanghai} style={style}>
          Allow
        </div>
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

  '@keyframes button': {
    '0%': {
      opacity: 0,
      transform: 'translateX(0%)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateX(-100%)',
    },
  },
  
  base: {
    position: 'relative',
  },

  shanghaiButton: {
    display: 'none',
    position: 'absolute',
    top: '10%',
    left: 0,
    fontSize: 'var(--size)',
    color: '#ccc',
    background: 'linear-gradient(-90deg, #0005, #0000)',
    border: '2px solid #fff5',
    boxShadow: 'inset 0 0 0.3em #fff3, 0 0.3em 0.5em #0005',
    borderRight: 'none',
    backdropFilter: 'blur(3px)',
    padding: '0.3em 0.4em 0.3em 0.5em',
    borderRadius: '0.5em 0 0 0.5em',
    transition: 'color 0.2s ease, border-color 0.2s ease',
    transform: 'translateX(-100%)',

    '&.show': {
      display: 'block',
      animation: '$button 1s ease backwards',
      animationDelay: '0.5s',
      cursor: 'pointer',
    },

    '&:hover': {
      color: '#fff',
      borderColor: '#ddd',
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