import { CSSProperties, MouseEventHandler, RefObject } from 'react';
import { createUseStyles } from 'react-jss';
import { Card, ctool } from 'shared';
import cx from 'classnames';
import { EmptyCard } from './EmptyCard';
import { BackCard } from './BackCard';
import { DummyCard } from './DummyCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

type Props = {
  card?: Card;
  back?: boolean;
  dummy?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
  size?: string | number;
  style?: CSSProperties;
  pointer?: boolean;
  hover?: boolean;
  innerRef?: RefObject<HTMLElement>;
  isNew?: boolean;
};

export function PlayingCard(p: Props) {
  const s = useStyles();
  const theme = useSelector((state: RootState) => state.theme);

  const style = {
    ...p.style,
    fontSize: p.size ?? 30,
    cursor: p.onClick || p.pointer ? 'pointer' : 'default',
  };

  if (p.dummy)
    return <DummyCard size={p.size} />;
  if (p.back)
    return <BackCard {...p} />;
  if (!p.card)
    return <EmptyCard {...p} />;
  return (
    <div
      ref={(p.innerRef as any)}
      className={cx(s.card, p.className, ctool.color(p.card), p.hover && 'hover', theme, p.isNew && 'new')}
      onClick={p.onClick} style={style}
    >
      <i>{convert(ctool.suitIcon(p.card))}</i>
      <i>{convert(ctool.suitIcon(p.card))}</i>
      <i>{convert(ctool.suitIcon(p.card))}</i>
      <span>{ctool.rankPrefix(p.card)}</span>
      <span>{ctool.rankPrefix(p.card)}</span>
      {p.isNew && <div className={s.new}><FontAwesomeIcon icon={solid('bookmark')} /></div>}
      {p.isNew && <div className={s.new}><FontAwesomeIcon icon={solid('bookmark')} /></div>}
      {p.isNew && <div className={s.new}><FontAwesomeIcon icon={solid('bookmark')} /></div>}
      {p.isNew && <div className={s.new}><FontAwesomeIcon icon={solid('bookmark')} /></div>}
    </div>
  );

  function convert(suit: string) {
    if (theme === 'classic')
      return suit;
    let icon: any;

    switch (suit) {
      case '♠':
        icon = solid('chess-king');
        break;
      case '♣':
        icon = solid('chess-rook');
        break;
      case '♥':
        icon = solid('chess-queen');
        break;
      case '♦':
        icon = solid('chess-bishop');
        break;
      default:
        icon = solid('question');
        break;
    }

    return <FontAwesomeIcon icon={icon} />;
  }
}

const useStyles = createUseStyles({
  new: {
    // color: '#775D59',
    color: '#464646',
    // color: 'darkgrey',
    fontSize: '1.5em',
    position: 'absolute',
    zIndex: -1,
    top: '-0.3em',
    left: '0.17em',
    
    '.red &': {
      // color: 'var(--card-red)',
      color: '#cd6767',
    },
    
    '&:nth-of-type(1)': {
      filter: 'drop-shadow(0 0 0.3em #0008)',
    },
    
    '&:nth-of-type(2)': {
      top: '0.1em',
    },
    
    '&:nth-of-type(3)': {
      bottom: '-0.3em',
      right: '0.18em',
      transform: 'rotate(180deg)',
      filter: 'drop-shadow(0 0 0.3em #0008)',
    },
    
    '&:nth-of-type(4)': {
      bottom: '0.1em',
      right: '0.18em',
      transform: 'rotate(180deg)',
    },
  },

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
    userSelect: 'none',
    filter: 'drop-shadow(4px 4px 5px #0009)',
    boxSizing: 'border-box',

    '&.hover': {
      transition: 'transform 200ms ease',

      '&:hover': {
        transform: 'translateY(-0.5em) scale(1.05)',
      },
    },

    '&.red': {
      color: 'var(--card-red)',
    },

    '&.noMouse': {
      pointerEvents: 'none',
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      border: '1px dashed #0003',
      inset: '0.25em',
      borderRadius: '0.15em',
    },

    '& i, & span': {
      '--offset-l': '1em',
      '--offset-r': '1em',
      '--offset-t': '1em',
      '--offset-b': '1em',
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 0,
      width: 0,
    },
    
    '&.new span': {
      color: '#ccc',
    },

    '&.classic i': {
      fontSize: '1.35em',
      '--offset-l': '0.5em',
      '--offset-r': '0.5em',
      '--offset-t': '0.6em',
      '--offset-b': '0.7em',

      '&:nth-child(3)': {
        fontSize: '5em',
      },
    },

    '& i': {
      fontSize: '0.9em',
    },

    '& i:nth-child(1)': {
      justifyContent: 'right',
      top: 'calc(1.1 * var(--offset-t))',
      right: 'calc(0.6 * var(--offset-r))',
    },
    '& i:nth-child(2)': {
      justifyContent: 'left',
      bottom: 'calc(1.1 * var(--offset-b))',
      left: 'calc(0.6 * var(--offset-l))',
    },
    '& i:nth-child(3)': {
      fontSize: '3em',
      height: '95%',
      width: '100%',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    '& span:nth-child(4)': {
      justifyContent: 'left',
      top: 'calc(0.9 * var(--offset-t))',
      left: 'calc(0.5 * var(--offset-l))',
    },
    '& span:nth-child(5)': {
      justifyContent: 'right',
      bottom: 'calc(1 * var(--offset-b))',
      right: 'calc(0.5 * var(--offset-r))',
    },
  }
});