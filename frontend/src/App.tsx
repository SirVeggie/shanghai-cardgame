import { useDispatch, useSelector } from 'react-redux';
import { NotificationEmitter } from './components/NotificationEmitter';
import { Toggle } from './components/Toggle';
import { Game } from './views/Game';
import { Home } from './views/Home';
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

let hasInitialised = false;

export function App() {
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
    <div className='app'>
      <NotificationEmitter />

      <SlideButton text='Leave' icon={solid('sign-out-alt')}
        xOffset='2.5em' hide={!gameState} onClick={clickBack}
      />

      <Toggle on={gameState === undefined}>
        <Home />
      </Toggle>

      <Toggle on={gameState === 'waiting-players'}>
        <Lobby />
      </Toggle>

      <Toggle on={!!gameState && gameState !== 'waiting-players' && gameState !== 'game-end'}>
        <Game />
      </Toggle>

      <Toggle on={gameState === 'game-end'}>
        <GameEnd />
      </Toggle>
    </div>
  );
}
