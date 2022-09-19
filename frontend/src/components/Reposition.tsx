import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Draggable from 'react-draggable';
import { createUseStyles } from 'react-jss';
import { useTouch } from '../hooks/useTouch';
import cx from 'classnames';
import { CSSProperties } from 'react';

type Props = {
  children: React.ReactNode;
  hideHandle?: boolean;
  className?: string;
  innerClass?: string;
  handleOffset?: { x?: string, y?: string, rot?: string; };
  size?: string;
};

export function Reposition(p: Props) {
  const s = useStyles();
  const touch = useTouch();
  
  const style = {
    fontSize: p.size,
    '--handle-x': `${p.handleOffset?.x ?? '-30px'}`,
    '--handle-y': `${p.handleOffset?.y ?? '-30px'}`,
    '--handle-rot': `${p.handleOffset?.rot ?? '0deg'}`,
  } as CSSProperties;

  return (
    <Draggable handle='.repositionHandle'>
      <div className={cx(s.base, p.className, touch && 'touch', p.hideHandle && 'hide')}>
        <div className='repositionHandle' style={style}><FontAwesomeIcon icon={solid('eject')} /></div>
        <div className={p.innerClass}>
          {p.children}
        </div>
      </div>
    </Draggable>
  );
}

const useStyles = createUseStyles({
  base: {
    padding: '50px 0 0 50px',
    margin: '0 50px 50px 0',

    '&:not(.hide):hover > :first-child, &.touch:not(.hide) div:first-child': {
      opacity: 1,
    },
    
    '& > :first-child': {
      position: 'absolute',
      opacity: 0,
      width: 'min(6em, 100px)',
      height: 'min(6em, 100px)',
      borderRadius: '5px 0 0 0',
      background: 'linear-gradient(135deg, #0005 0%, #0000 50%)',
      transformOrigin: 'top left',
      transform: 'translate(calc(var(--handle-x)), calc(var(--handle-y))) rotate(var(--handle-rot))',
      cursor: 'all-scroll',
      transition: 'opacity 200ms ease-out',
      pointerEvents: 'initial',
      
      '& > svg': {
        fontSize: 20,
        color: '#ccc',
        position: 'absolute',
        top: 4,
        left: 5,
        transform: 'rotate(-45deg)',
      },
    },
  }
});