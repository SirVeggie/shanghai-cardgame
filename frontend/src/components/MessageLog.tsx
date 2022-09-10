import { CSSProperties } from 'react';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';

export type EventMessage = {
  id: string,
  type: 'info' | 'error',
  message: string;
};

type Props = {
  className?: string;
  style?: CSSProperties;
  messages: EventMessage[];
};

export function MessageLog(p: Props) {
  const s = useStyles();
  return (
    <div className={cx(s.base, p.className)} style={p.style}>
      {p.messages.map(m => (
        <div key={m.id} className={cx(s.message, m.type === 'error' && 'error')}>{m.message}</div>
      ))}
    </div>
  );
}

const useStyles = createUseStyles({
  base: {
    background: 'linear-gradient(0deg, #0005, #0000)',
    backdropFilter: 'blur(3px)',
    padding: '0.2em 0.5em 0.5em 0.5em',
    borderRadius: '0.3em',
    border: '1px solid #fff5',
    boxShadow: 'inset 0 0 0.3em #fff3, 0 0 0.5em #0005',
    color: '#ccc',
    overflow: 'auto',
    
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#0002',
      border: 'none',
    }
  },
  
  message: {
    boxSizing: 'border-box',
    
    '&::first-letter': {
      textTransform: 'uppercase',
    },
    
    '&.error': {
      color: '#faa',
    },
    
    '&:first-child': {
      animation: '$slide-down 0.5s ease-in-out',
    },
    
    '&:not(:last-child)': {
      marginBottom: '0.3em',
      paddingBottom: '0.3em',
      borderBottom: '2px solid #0002',
      translate: 'all 500ms ease',
    },
  },
  
  '@keyframes slide-down': {
    from: {
      marginBottom: '-1.8em',
      transform: 'scaleY(0)',
      opacity: 0,
    },
    
    to: {
      marginBottom: '0.3em',
      transform: 'scaleY(1)',
      opacity: 1,
    }
  },
});