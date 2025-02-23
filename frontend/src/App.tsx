import { useDispatch, useSelector } from 'react-redux';
import { NotificationEmitter } from './components/NotificationEmitter';
import { Toggle } from './components/Toggle';
import { Game } from './views/Game';
import { Sessions } from './views/Sessions';
import { Lobby } from './views/Lobby';
import { RootState } from './store';
import { GameEnd } from './views/GameEnd';
import { useEffect } from 'react';
import { useJoinParams } from './hooks/useJoinParams';
import { joinSession } from './backend';
import { sessionActions } from './reducers/sessionReducer';
import { SlideButton } from './components/SlideButton';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { GameEvent, GAME_EVENT } from 'shared';
import { useLocalSocket } from './hooks/useWebSocket';
import { createUseStyles } from 'react-jss';

let hasInitialised = false;

export function App() {
  const s = useStyles();
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.session?.state);
  const [params, setParams] = useJoinParams();
  const ws = useLocalSocket();
  
  useEffect(() => {
    if (hasInitialised)
      return;
    if (gameState || params)
      hasInitialised = true;
    if (!gameState && params) {
      joinSession(params).then(session => {
        dispatch(sessionActions.setSession(session));
      }).catch(err => {
        console.log(err.message ?? err);
        setParams(null);
      });
    }
  }, [params?.lobbyName]);
  
  const clickBack = () => {
    setParams(null);
    dispatch(sessionActions.clearSession());
    ws.send({
      type: GAME_EVENT,
      action: 'disconnect',
    } as GameEvent);
  };

  return (
    <div className={s.app}>
      <NotificationEmitter />

      <SlideButton text='Leave' icon={solid('sign-out-alt')}
        xOffset='2.5em' hide={!gameState} onClick={clickBack}
      />

      <Toggle on={gameState === undefined}>
        <Sessions />
      </Toggle>

      <Toggle on={gameState === 'waiting-players'}>
        <Lobby />
      </Toggle>

      <Toggle on={!!gameState && gameState !== 'waiting-players' && gameState !== 'game-end'}>
        <div className='dark' />
        <Game />
      </Toggle>

      <Toggle on={gameState === 'game-end'}>
        <GameEnd />
      </Toggle>
      
      <Toggle on={gameState === undefined && !!params}>
        <div className='dark' />
      </Toggle>
    </div>
  );
}

const useStyles = createUseStyles({
  app: {
    width: '100vw',
    height: '100vh',
    
    background: 'url("/poker-table-background-no-watermark.jpg")',
    boxSizing: 'border-box',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    
    overflow: 'hidden',
    
    '& .dark': {
      backgroundColor: 'black',
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
  },
});