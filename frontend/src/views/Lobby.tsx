import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { ERROR_EVENT, GameEvent, PlayerPublic, SYNC_EVENT, WebEvent } from 'shared';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useJoinParams } from '../hooks/useJoinParams';
import { useNotification } from '../hooks/useNotification';
import { useSessionComms } from '../hooks/useSessionComms';
import { sessionActions } from '../reducers/sessionReducer';
import { RootState } from '../store';

export function Lobby() {
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.session)!;
  const s = useStyles();
  const [joinParams] = useJoinParams();
  const notify = useNotification();

  const ws = useSessionComms(joinParams, (event: WebEvent) => {
    if (event.type === SYNC_EVENT)
      dispatch(sessionActions.setSession(event.session));
    if (event.type === ERROR_EVENT)
      notify.create('error', event.message);
  });

  const ready = (player: PlayerPublic): string => {
    return player.isReady ? 'Ready' : 'waiting...';
  };

  const setReady = () => {
    if (!session?.me)
      return;

    const event: GameEvent = {
      type: 'game',
      action: 'set-ready',
      playerId: session.me.id,
      sessionId: session.id,
    };

    ws.send(event);
  };

  return (
    <Container>
      <div className={s.container}>
        <div className={s.lobby}>
          <h2>Waiting for players</h2>
          <div className={s.players}>
            {session.players.map(p => (
              <div key={p.id}>{p.name + (session.me?.id === p.id ? ' (you)' : '')} - {ready(p)}</div>
            ))}
          </div>
          <Button text='Ready'
            disabled={session.me?.isReady || session.players.length < 2}
            onClick={setReady}
          />
        </div>
      </div>
    </Container>
  );
}

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
  },

  lobby: {
    // display: 'flex',
    // justifyContent: 'center',
    // flexDirection: 'column',
    textAlign: 'center',
    marginTop: '10vh',
    // width: '50%',
    borderRadius: 5,
    padding: '20px 40px',
    backgroundColor: 'white',

    '& h2': {
      margin: 0,
      marginBottom: 20,
    },
  },

  players: {
    marginBottom: 20,
  }
});