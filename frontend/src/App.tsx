import { useSelector } from 'react-redux';
import { NotificationEmitter } from './components/NotificationEmitter';
import { Toggle } from './components/Toggle';
import { Game } from './views/Game';
import { Home } from './views/Home';
import { Lobby } from './views/Lobby';
import { RootState } from './store';
import { GameEnd } from './views/GameEnd';

export function App() {
  const gameState = useSelector((state: RootState) => state.session.game?.state);
  
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
