import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CSSProperties } from 'react';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';

type Props = {
  text: string;
  icon?: IconDefinition;
  xOffset?: string;
  yOffset?: string;
  onClick?: () => void;
  style?: CSSProperties;
  hide?: boolean;
  attention?: boolean;
};

export function SlideButton(p: Props) {
  const s = useStyles();

  const number = p.yOffset?.match(/\d+/)?.[0];
  const style = {
    ...p.style,
    '--x-offset': p.xOffset ?? '0px',
    '--y-offset': p.yOffset ?? '0px',
    '--delay': number ? `${number}0ms` : '0ms',
  } as CSSProperties;

  return (
    <button className={cx(s.button, p.hide && 'hide', p.attention && 'attention')} onClick={p.onClick} style={style}>
      <span className={s.text}>{p.text}</span>
      {p.icon && <FontAwesomeIcon icon={p.icon} size='xl' />}
    </button>
  );
}

const useStyles = createUseStyles({
  button: {
    position: 'fixed',
    top: 'calc(10vh + var(--y-offset))',
    left: 0,
    border: '1px solid #fff5',
    borderLeft: 'none',
    padding: '0.5rem 0.6rem',
    borderRadius: '0 0.5rem 0.5rem 0',
    backgroundColor: '#0003',
    color: '#ddde',
    cursor: 'pointer',
    zIndex: 1,
    transition: 'transform 350ms ease, background 350ms ease, color 350ms ease',
    transform: 'translateX(calc(-100% + var(--x-offset)))',
    animation: '$slideIn 1000ms ease',
    animationDelay: 'calc(4s + var(--delay) * 3)',
    animationFillMode: 'backwards',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    
    '&:hover': {
      animation: '$slideIn 0ms ease',
      backgroundColor: '#fffe',
      color: '#000d',
      transform: 'translateX(0px)',
    },
    
    '&.hide': {
      transform: 'translateX(-100%)',
      animation: 'none',
    },
    
    '&.attention': {
      animation: '$slideIn 0ms ease',
      transform: 'translateX(0px)',
    },
  },

  text: {
    marginRight: '0.5rem',
  },

  '@keyframes slideIn': {
    from: {
      transform: 'translateX(-120%)',
    },

    to: {
      transform: 'translateX(calc(-100% + var(--x-offset)))',
    }
  },
});