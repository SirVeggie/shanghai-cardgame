import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Draggable from 'react-draggable';
import { createUseStyles } from 'react-jss';
import { useTouch } from '../hooks/useTouch';
import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  hideHandle?: boolean;
  className?: string;
  innerClass?: string;
};

export function Reposition(p: Props) {
  const s = useStyles();
  const touch = useTouch();

  return (
    <Draggable handle='.repositionHandle'>
      <div className={cx(s.base, p.className, touch && 'touch', p.hideHandle && 'hide')}>
        <div className='repositionHandle'><FontAwesomeIcon icon={solid('eject')} /></div>
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
      width: 100,
      height: 100,
      borderRadius: '5px 0 0 0',
      background: 'linear-gradient(135deg, #0005 0%, #0000 50%)',
      transform: 'translate(-30px, -30px)',
      cursor: 'all-scroll',
      transition: 'opacity 200ms ease-out',

      '& > svg': {
        fontSize: 20,
        position: 'absolute',
        top: 5,
        left: 5,
        transform: 'rotate(-45deg)',
      },
    },
  }
});