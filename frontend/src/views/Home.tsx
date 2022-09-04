import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';
import { GameJoinParams, SessionListEvent, SessionPublic, SESSION_LIST_EVENT } from 'shared';
import { createSession, joinSession } from '../backend';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { SessionCard } from '../components/SessionCard';
import { useForm } from '../hooks/useForm';
import { useJoinParams } from '../hooks/useJoinParams';
import { useNotification } from '../hooks/useNotification';
import { useLocalSocket } from '../hooks/useWebSocket';
import { sessionActions } from '../reducers/sessionReducer';

export function Home() {
  const s = useStyles();
  const dispatch = useDispatch();
  const [sessions, setSessions] = useState([] as SessionPublic[]);
  const [sessionName, setSessionName] = useState('');
  const [_, setParams] = useJoinParams();
  const notify = useNotification();

  useLocalSocket({ type: SESSION_LIST_EVENT, action: 'subscribe' }, (event: SessionListEvent) => {
    if (!event || event.type !== SESSION_LIST_EVENT || event.action !== 'update')
      return;
    setSessions(event.sessions);
  });

  const createForm = useForm('Create game', {
    game: { label: 'Game', type: 'text' },
    player: { label: 'Your name', type: 'text' },
    password: { label: 'Password', type: 'password' },
  }, data => {
    const params: GameJoinParams = {
      lobbyName: data.game,
      playerName: data.player,
      password: data.password,
    };

    createSession(params).then(session => {
      dispatch(sessionActions.setSession(session));
      setParams(params);
    }).catch(err => {
      notify.create('error', err.message ?? err);
    });
  });

  const joinForm = useForm('Join game', {
    player: { label: 'Your name', type: 'text' },
    password: { label: 'Password', type: 'password' },
  }, data => {
    const params: GameJoinParams = {
      lobbyName: sessionName,
      playerName: data.player,
      password: data.password,
    };

    joinSession(params).then(session => {
      dispatch(sessionActions.setSession(session));
      setParams(params);
    }).catch(err => {
      notify.create('error', err.message ?? err);
    });
  });

  const clickJoin = (session: SessionPublic) => {
    return () => {
      setSessionName(session.name);
      joinForm.setOpen(true);
    };
  };

  return (
    <Container className={s.container}>
      {createForm.component}
      {joinForm.component}
      <div className={s.center}>
        <Button text='New Game' onClick={() => createForm.setOpen(true)} />
      </div>
      {sessions.map(session => (
        <SessionCard key={session.id} session={session} onClick={clickJoin(session)} />
      ))}
    </Container>
  );
}

const useStyles = createUseStyles({
  container: {
    marginTop: '10vh',
  },

  center: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
  }
});