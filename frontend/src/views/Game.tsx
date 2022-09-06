import cx from 'classnames';
import { CSSProperties, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { defaultConfig, ERROR_EVENT, generateDeck, getPlayerRoundPoints, MESSAGE_EVENT, SessionPublic, shuffle, SYNC_EVENT, uuid } from 'shared';
import { CardFan } from '../components/CardFan';
import { DiscardPile } from '../components/DiscardPile';
import { DrawPile } from '../components/DrawPile';
import { useJoinParams } from '../hooks/useJoinParams';
import { useNotification } from '../hooks/useNotification';
import { useSessionComms } from '../hooks/useSessionComms';
import { DropInfo } from '../reducers/dropReducer';
import { sessionActions } from '../reducers/sessionReducer';
import { RootState } from '../store';
import { callShanghai, discardCard, drawDeck, drawDiscard, revealCard, setReady } from '../tools/actions';
import { DropArea } from '../components/dragging/DropArea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Reposition } from '../components/Reposition';
import { MeldCards } from '../components/MeldCards';
import { EventMessage, MessageLog } from '../components/MessageLog';
import { SlideButton } from '../components/SlideButton';
import { themeActions } from '../reducers/themeReducer';

export function Game() {
  const s = useStyles();
  const dispatch = useDispatch();
  const [params] = useJoinParams();
  const notify = useNotification();
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const session = useSelector((state: RootState) => state.session)!;

  const ws = useSessionComms(params, event => {
    if (event.type === SYNC_EVENT)
      dispatch(sessionActions.setSession(event.session));
    if (event.type === ERROR_EVENT)
      log(event.message, 'error');
    if (event.type === MESSAGE_EVENT)
      log(event.message, 'info');
  });

  const log = (message: string, type: 'info' | 'error' = 'info') => {
    setMessages(msgs => [{ id: uuid(), type, message }, ...(msgs.slice(0, 25))]);
  };

  const fan = {
    angle: 5 / (session.me!.cards.length * 0.1),
    size: 'min(2vw, 30px)',
    spacing: Math.min(3, 3 / (session.me!.cards.length * 0.07)),
  };

  const deckSize = 'min(5vh, 30px)';

  const onDraw = (info: DropInfo) => {
    if (!session.me)
      return notify.create('error', 'You are not in this game');
    if (info.type === 'deck-card') {
      ws.send(drawDeck(session.id, session.me.id));
    } else if (info.type === 'discard-card') {
      if (session.currentPlayerId !== session.me.id)
        ws.send(callShanghai(session.id, session.me.id));
      else
        ws.send(drawDiscard(session.id, session.me.id));
    }
  };

  const onDiscard = (info: DropInfo) => {
    if (!session.me)
      return notify.create('error', 'You are not in this game');
    if (info.type === 'hand-card')
      ws.send(discardCard(session.id, session.me.id, info.data));
    if (info.type === 'deck-card')
      ws.send(revealCard(session.id, session.me.id));
  };
  
  const playerReady = () => {
    ws.send(setReady(session.id, session.me!.id));
  };

  const winningPlayer = session.players.reduce((min, p) => {
    return p.points < min.points ? { points: p.points, player: p } : min;
  }, {
    points: session.players[0].points,
    player: session.players[0],
  }).player;

  return (
    <div className={s.game}>
      <SlideButton text='Set Ready' icon={solid('user-check')}
        xOffset='2.9em' yOffset='3em' onClick={playerReady}
        attention={session.state === 'round-end' && session.me?.isReady === false}
      />
      <SlideButton text='Classic Theme' icon={solid('heart')}
        xOffset='2.5em' yOffset='8em'
        onClick={() => dispatch(themeActions.setTheme('classic'))}
      />
      <SlideButton text='Chess Theme' icon={solid('chess-board')}
        xOffset='2.3em' yOffset='11em'
        onClick={() => dispatch(themeActions.setTheme('chess'))}
      />

      {/*-----------------------------------------------------------------------*/}

      <div className={s.roundInfo}>
        Round {session.round}/{session.config.rounds.length}{' - '}
        {session.config.rounds[session.round - 1].description}
      </div>

      {/*-----------------------------------------------------------------------*/}

      <div className={s.players}>
        <div>
          <i></i>
          {session.players.map(p => (<div key={p.id}>
            {p.id === winningPlayer.id && <i><FontAwesomeIcon icon={solid('crown')} size='sm' /></i>}
          </div>))}
        </div>

        <div>
          <i><FontAwesomeIcon icon={solid('user-secret')} /></i>
          {/* <i><FontAwesomeIcon icon={solid('user-group')} /></i> */}
          {session.players.map(p => (
            <div key={p.id} className={cx(s.player, session.currentPlayerId === p.id && 'current')}>{p.name}</div>
          ))}
        </div>

        <div>
          <i><FontAwesomeIcon icon={solid('head-side-cough')} /></i>
          {session.players.map(p => <div key={p.id}>{p.remainingShouts}</div>)}
        </div>

        <div>
          <i><FontAwesomeIcon icon={solid('hands')} /></i>
          {session.players.map(p => <div key={p.id}>{p.cardAmount}</div>)}
        </div>

        <div>
          <i><FontAwesomeIcon icon={solid('trophy')} /></i>
          {session.players.map(p => <div key={p.id}>
            {p.points}
            {session.me?.id === p.id ? ` + ${getPlayerRoundPoints(session.config, session.me)}` : ''}
          </div>)}
        </div>

        <div>
          <i><FontAwesomeIcon icon={solid('hourglass-half')} /></i>
          {session.players.map(p => <div key={p.id}>{(p.playtime / 1000 / 60).toFixed(0)}m</div>)}
        </div>
      </div>

      {/*-----------------------------------------------------------------------*/}

      <div className={s.meldInfo}>
        <span>Melds</span>
        {session.config.rounds[session.round].melds.map((config, i) => (
          <div key={i}>{config.type} of {config.length}</div>
        ))}
      </div>

      {/*-----------------------------------------------------------------------*/}

      <MessageLog messages={messages} className={s.log} />

      {/*-----------------------------------------------------------------------*/}

      <div className={s.decks}>
        <Reposition>
          <div className='inner'>
            <DiscardPile size={deckSize} discard={session.discard} onDrop={onDiscard} />
            <DrawPile size={deckSize} amount={session.deckCardAmount} />
          </div>
        </Reposition>
      </div>

      {/*-----------------------------------------------------------------------*/}

      <div className={s.privateMelds}>
        <Reposition innerClass='drag'>
          {session.me?.melds.map((meld, i) => (
            <MeldCards key={i} meld={meld} player={session.players.find(x => x.id === session.me?.id)!} />
          ))}
        </Reposition>
      </div>;

      {/*-----------------------------------------------------------------------*/}

      <div className={s.hand} style={{ '--size': fan.size } as CSSProperties}>
        <DropArea className={s.handDrop} onDrop={onDraw}>
          <div className='inner'>
            <CardFan drag cards={session.me!.cards} {...fan} cardType='hand-card' />
          </div>
        </DropArea>
      </div>
    </div >
  );
}

const useStyles = createUseStyles({
  game: {
    position: 'relative',
    overflow: 'hidden',
    width: '100vw',
    height: '100vh',
  },

  roundInfo: {
    position: 'absolute',
    top: 0,
    left: '50%',
    fontSize: 'min(1.5em, 4vh)',
    backgroundColor: '#0005',
    color: '#ccc',
    border: '2px solid #000a',
    borderTop: 'none',
    transform: 'translateX(-50%)',
    padding: '0.2em 1em 0.5em 1em',
    borderRadius: '0 0 0.5em 0.5em',
    backdropFilter: 'blur(3px)',
    textAlign: 'center',
  },

  meldInfo: {
    position: 'absolute',
    top: '40vh',
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
    fontSize: 'min(1.5em, 4vh)',
    backgroundColor: '#0005',
    color: '#ccc',
    border: '2px solid #000a',
    borderRight: 'none',
    transform: 'translateY(-50%)',
    padding: '1em',
    borderRadius: '0.5em 0 0 0.5em',
    backdropFilter: 'blur(3px)',

    '& > span': {
      borderBottom: '1px solid #000a',
      paddingBottom: '0.2em',
      marginBottom: '0.5em',
    },
  },

  log: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 'min(20vw, 30vh)',
    maxHeight: '20vh',
    fontSize: 'min(1.5em, 1vw)',
    borderBottom: 'none',
    borderLeft: 'none',
    borderRadius: '0 0.3em 0 0',
  },

  privateMelds: {
    position: 'absolute',
    top: '25vh',
    left: '25vw',
    pointerEvents: 'none',

    '& > div': {
      pointerEvents: 'initial',
    },

    '& .drag': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',

      '& > div': {
        marginBottom: '3em',
      },
    },
  },

  publicMelds: {

  },

  player: {
    color: '#ccca',

    '&.current': {
      color: '#ccc',
      textDecoration: 'underline',
    },
  },
  players: {
    position: 'absolute',
    display: 'flex',
    top: 0,
    right: 0,
    fontSize: 'min(1.5em, 4vh)',
    backgroundColor: '#0005',
    color: '#ccc',
    border: '2px solid #000a',
    borderTop: 'none',
    borderRight: 'none',
    padding: '0.5em 1em 1em 1em',
    borderBottomLeftRadius: '0.5em',
    backdropFilter: 'blur(3px)',

    '& > div': {
      display: 'flex',
      flexDirection: 'column',

      '&:not(:last-child)': {
        marginRight: '1em',
      },

      '& > :first-child': {
        height: '1.3em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },

      '&:not(:first-child)': {
        textAlign: 'center',
      },
    },
  },

  decks: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: '25vh',
    left: 0,
    right: 0,

    '& .inner': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },

    '& .inner > :first-child': {
      marginRight: '1em',
    }
  },

  hand: {
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: 'calc(100vh - var(--size) * 10)',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,

    '& .inner > div': {
      pointerEvents: 'initial',
    },
  },

  handDrop: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',

    '& > div': {
      position: 'absolute',
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '50%',
    },
  }
});

const deck = shuffle(generateDeck(2, 4));
const session: SessionPublic = {
  id: '123',
  name: 'test',
  config: defaultConfig,
  currentPlayerId: 'asd',
  players: [{
    id: 'asd',
    name: 'test',
    isReady: false,
    cardAmount: 5,
    melds: [],
    points: 129,
    remainingShouts: 3,
    tempCards: [],
    playtime: 420000,
  }, {
    id: 'asd2',
    name: 'test2',
    isReady: false,
    cardAmount: 11,
    melds: [],
    points: 74,
    remainingShouts: 3,
    tempCards: [],
    playtime: 90000,
  }],
  round: 1,
  state: 'turn-start',
  turn: 1,
  deckCardAmount: deck.length,
  turnStartTime: Date.now(),
  discard: {
    top: deck.slice(20, 21)[0],
    bottom: deck.slice(21, 22)[0],
  },

  me: {
    id: 'asd',
    name: 'test',
    isReady: false,
    melds: [{ cards: deck.slice(50, 57), config: { type: 'straight', length: 5 } },
    { cards: deck.slice(57, 60), config: { type: 'set', length: 3 } },
    { cards: deck.slice(60, 64), config: { type: 'straight', length: 4 } },
    ],
    points: 129,
    remainingShouts: 3,
    tempCards: [],
    newCards: deck.slice(0, 2),
    cards: deck.slice(0, 5),
    playtime: 420000,
  }
};
