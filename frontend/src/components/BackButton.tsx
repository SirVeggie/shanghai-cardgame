import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';
import { useJoinParams } from '../hooks/useJoinParams';
import { sessionActions } from '../reducers/sessionReducer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useLocalSocket } from '../hooks/useWebSocket';
import { GameEvent, GAME_EVENT } from 'shared';

export function BackButton() {
  const s = useStyles();
  const dispatch = useDispatch();
  const [_, setParams] = useJoinParams();
  
  const ws = useLocalSocket();
  
  const click = () => {
    setParams(null);
    dispatch(sessionActions.clearSession());
    ws.send({
      type: GAME_EVENT,
      action: 'disconnect',
    } as GameEvent);
  };
  
  return (
    <button className={s.back} onClick={click}>
      <span className={s.text}>Leave</span>
      <FontAwesomeIcon icon={solid('square-caret-left')} size='xl' />
    </button>
  );
}

const useStyles = createUseStyles({
  back: {
    position: 'fixed',
    top: '10vh',
    left: 0,
    border: '1px solid #0003',
    padding: '0.5rem 0.6rem',
    borderRadius: '0 0.5rem 0.5rem 0',
    background: '#ddd5',
    cursor: 'pointer',
    zIndex: 1,
    transition: 'transform 350ms ease, background 350ms ease',
    transform: 'translateX(-3.8rem)',
    animation: '$slideIn 1000ms ease',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    
    '&:hover': {
      background: '#fffe',
      transform: 'translateX(0px)',
    },
  },
  
  text: {
    marginRight: '0.5rem',
  },
  
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(-10rem)',
    },
    
    to: {
      transform: 'translateX(-3.8rem)',
    }
  }
});