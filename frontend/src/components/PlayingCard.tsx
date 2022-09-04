import { CSSProperties, MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import { Card, ctool } from 'shared';
import cx from 'classnames';

type Props = {
  card: Card;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
  size?: string | number;
  style?: CSSProperties;
}

export function PlayingCard(p: Props) {
  const s = useStyles();
  
  const style = {
    ...p.style,
    fontSize: p.size ?? 30,
  };
  
  return (
    <div className={cx(s.card, p.className, ctool.color(p.card))} onClick={p.onClick} style={style}>
      <i>{ctool.suitIcon(p.card)}</i>
      <i>{ctool.suitIcon(p.card)}</i>
      <i>{ctool.suitIcon(p.card)}</i>
      <span>{ctool.rankPrefix(p.card)}</span>
      <span>{ctool.rankPrefix(p.card)}</span>
    </div>
  );
}

const useStyles = createUseStyles({
  card: {
    fontSize: '30px',
    width: '5em',
    height: '8em',
    border: '1px solid #0003',
    borderRadius: '0.3em',
    background: '#ddd',
    overflow: 'hidden',
    backgroundClip: 'content-box',
    color: 'var(--card-black)',
    cursor: 'pointer',
    userSelect: 'none',
    filter: 'drop-shadow(4px 4px 5px #0009)',
    
    '&.red': {
      color: 'var(--card-red)',
    },
    
    '&.noMouse': {
      pointerEvents: 'none',
    },
    
    '&:not(.back)::after': {
      content: '""',
      position: 'absolute',
      border: '1px dashed #0003',
      inset: '0.25em',
      borderRadius: '0.15em',
    },
    
    '& i, & span': {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 0,
      width: 0,
    },
    
    '& i': {
      fontSize: '1.25em',
    },
    
    '& i:nth-child(1)': {
      justifyContent: 'right',
      top: '0.65em',
      right: '0.35em',
    },
    '& i:nth-child(2)': {
      justifyContent: 'left',
      bottom: '0.7em',
      left: '0.35em',
    },
    '& i:nth-child(3)': {
      fontSize: '5em',
      height: '95%',
      width: '100%',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    '& span:nth-child(4)': {
      justifyContent: 'left',
      top: '0.85em',
      left: '0.5em',
    },
    '& span:nth-child(5)': {
      justifyContent: 'right',
      bottom: '0.85em',
      right: '0.5em',
    },
  }
});