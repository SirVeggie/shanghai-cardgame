import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { PlayerPublic, WebEvent } from 'shared';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useJoinParams } from '../hooks/useJoinParams';
import { useLocalSocket } from '../hooks/useWebSocket';
import { sessionActions } from '../reducers/sessionReducer';
import { RootState } from '../store';

export function Lobby() {
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.session)!;
  const s = useStyles();
  const [joinParams] = useJoinParams();

  useLocalSocket({
    type: 'game',
    action: 'connect',
    join: joinParams!,
    playerId: '',
    sessionId: ''
  }, (event: WebEvent) => {
    if (event.type === 'sync')
      dispatch(sessionActions.setSession(event.session));
  });

  const ready = (player: PlayerPublic): string => {
    return player.isReady ? 'Ready' : 'waiting...';
  };

  return (
    <Container className={s.lobby}>
      <h1>Waiting for players</h1>
      <div className={s.players}>
        {session.players.map(p => <div key={p.id}>{p.name} - {ready(p)}</div>)}
      </div>
      <Button text='Ready' disabled={session.me?.isReady} />
    </Container>
  );
}

const useStyles = createUseStyles({
  lobby: {

  },

  players: {

  }
});