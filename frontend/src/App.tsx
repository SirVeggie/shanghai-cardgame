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

export function App() {
  const gameState = useSelector((state: RootState) => state.session?.state);
  const [params, setParams] = useJoinParams();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (params) {
      joinSession(params).then(session => {
        dispatch(sessionActions.setSession(session));
      }).catch(err => {
        console.log(err.message ?? err);
        setParams(undefined);
      });
    }
  }, [params]);
  
  return (
    <div className='app'>
      <NotificationEmitter />
      
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
