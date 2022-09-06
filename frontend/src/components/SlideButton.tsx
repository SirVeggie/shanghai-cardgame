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

  const style = {
    ...p.style,
    '--x-offset': p.xOffset ?? '0px',
    '--y-offset': p.yOffset ?? '0px',
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
    border: '1px solid #0003',
    padding: '0.5rem 0.6rem',
    borderRadius: '0 0.5rem 0.5rem 0',
    background: '#ddd5',
    cursor: 'pointer',
    zIndex: 1,
    transition: 'transform 350ms ease, background 350ms ease',
    transform: 'translateX(calc(-100% + var(--x-offset)))',
    animation: '$slideIn 1000ms ease',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    
    '&:hover': {
      animation: '$slideIn 0ms ease',
      background: '#fffe',
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