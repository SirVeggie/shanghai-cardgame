import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';
import { defaultConfig, ERROR_EVENT, GameJoinParams, SessionPublic, SESSION_LIST_EVENT, WebEvent } from 'shared';
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

  useLocalSocket({ type: SESSION_LIST_EVENT, action: 'subscribe' }, (event: WebEvent) => {
    if (event && event.type === SESSION_LIST_EVENT && event.action === 'update')
      setSessions(event.sessions);
    if (event && event.type === ERROR_EVENT)
      notify.create('error', event.message);
  });

  const createForm = useForm('Create game', {
    game: { label: 'Game', type: 'text' },
    player: { label: 'Your name', type: 'text' },
    password: { label: 'Password', type: 'password' },
    config: { label: 'Config', type: 'textarea' },
  }, data => {
    const params: GameJoinParams = {
      lobbyName: data.game,
      playerName: data.player,
      password: data.password,
      config: data.config ? JSON.parse(data.config) : undefined,
    };

    createSession(params).then(session => {
      setParams(params);
      dispatch(sessionActions.setSession(session));
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

  const clickCreate = () => {
    createForm.setOpen(true, {
      config: JSON.stringify(defaultConfig, null, 2),
    });
  };

  const clickJoin = (session: SessionPublic) => {
    return () => {
      setSessionName(session.name);
      joinForm.setOpen(true);
    };
  };

  return (
    <Container noPadding>
      <div className={s.base}>
        {createForm.component}
        {joinForm.component}
        
        <div className={s.center}>
          <Button text='New Game' onClick={clickCreate} />
        </div>
        <div className={s.sessions}>
          {sessions.map(session => (
            <SessionCard key={session.id} session={session} onClick={clickJoin(session)} />
          ))}
        </div>
      </div>
    </Container>
  );
}

const useStyles = createUseStyles({
  base: {
    paddingTop: '10vh',
    height: '100vh',
    boxSizing: 'border-box',
  },

  center: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    height: 30,
  },
  
  sessions: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 20,
    padding: '0 20px 20px 20px',
    maxHeight: 'calc(90vh - 70px)',
    overflow: 'auto',
  }
});