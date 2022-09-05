import { useDispatch, useSelector } from 'react-redux';
import { NotificationEmitter } from './components/NotificationEmitter';
import { Toggle } from './components/Toggle';
import { Game } from './views/Game';
import { Home } from './views/Home';
import { Lobby } from './views/Lobby';
import { RootState } from './store';
import { GameEnd } from './views/GameEnd';
import { BackButton } from './components/BackButton';
import { useEffect } from 'react';
import { useJoinParams } from './hooks/useJoinParams';
import { joinSession } from './backend';
import { sessionActions } from './reducers/sessionReducer';

let hasInitialised = false;

export function App() {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.session?.state);
  const [params, setParams] = useJoinParams();

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

  return (
    <div className='app'>
      <NotificationEmitter />

      <Toggle on={!!gameState}>
        <BackButton />
      </Toggle>

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
