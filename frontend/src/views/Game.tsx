import cx from 'classnames';
import { CSSProperties, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { canDiscard, canDrawDeck, canDrawDiscard, canRevealCard, Card, ERROR_EVENT, getPlayerRoundPoints, MeldConfig, MESSAGE_EVENT, SessionPublic, sortCards, SYNC_EVENT, uuid } from 'shared';
import { CardFan } from '../components/CardFan';
import { DiscardPile } from '../components/DiscardPile';
import { DrawPile } from '../components/DrawPile';
import { useJoinParams } from '../hooks/useJoinParams';
import { useNotification } from '../hooks/useNotification';
import { useSessionComms } from '../hooks/useSessionComms';
import { DropInfo } from '../reducers/dropReducer';
import { sessionActions } from '../reducers/sessionReducer';
import { RootState } from '../store';
import { callShanghai, discardCard, drawDeck, drawDiscard, meldCards, revealCard, setReady } from '../tools/actions';
import { DropArea } from '../components/dragging/DropArea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Reposition } from '../components/Reposition';
import { EventMessage, MessageLog } from '../components/MessageLog';
import { SlideButton } from '../components/SlideButton';
import { themeActions } from '../reducers/themeReducer';
import { MeldContainer, PrivateMeld } from '../components/MeldContainer';
import { resetDragAnimations } from '../tools/DOM';

export function Game() {
  const s = useStyles();
  const dispatch = useDispatch();
  const [params] = useJoinParams();
  const notify = useNotification();
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const session = useSelector((state: RootState) => state.session)!;
  const sessionRef = useRef(undefined as unknown as SessionPublic);
  const [melds, setMelds] = useState<PrivateMeld[]>([]);
  
  const ws = useSessionComms(params, event => {
    if (event.type === SYNC_EVENT) {
      dispatch(sessionActions.setSession(event.session));
      sessionRef.current = event.session;
    }
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

  const winningPlayer = session.players.reduce((min, p) => {
    return p.points < min.points ? { points: p.points, player: p } : min;
  }, {
    points: session.players[0].points,
    player: session.players[0],
  }).player;

  const onDraw = (info: DropInfo) => {
    if (!sessionRef.current.me)
      return notify.create('error', 'You are not in this game');
    if (info.type === 'deck-card') {
      
      if (canDrawDeck(sessionRef.current))
        resetDragAnimations();
      ws.send(drawDeck(sessionRef.current.id, sessionRef.current.me.id));
    } else if (info.type === 'discard-card') {
      if (sessionRef.current.currentPlayerId !== sessionRef.current.me.id) {
        ws.send(callShanghai(sessionRef.current.id, sessionRef.current.me.id));
      } else {
        if (canDrawDiscard(sessionRef.current))
          resetDragAnimations();
        ws.send(drawDiscard(sessionRef.current.id, sessionRef.current.me.id));
      }
    } else if (info.type === 'meld-card') {
      const id = findPrivateMeldId(info.data);
      if (!id)
        return notify.create('error', 'Could not find meld');
      removeFromPrivateMeld(id, info.data);
      resetDragAnimations();
    }
  };

  const onDiscardDrop = (info: DropInfo) => {
    if (!sessionRef.current.me)
      return notify.create('error', 'You are not in this game');
    if (info.type === 'hand-card') {
      if (canDiscard(sessionRef.current))
        resetDragAnimations();
      ws.send(discardCard(sessionRef.current.id, sessionRef.current.me.id, info.data));
    } else if (info.type === 'deck-card') {
      if (canRevealCard(sessionRef.current))
        resetDragAnimations();
      ws.send(revealCard(sessionRef.current.id, sessionRef.current.me.id));
    }
  };

  const onPrivateMeldAdd = (id: string) => {
    return (info: DropInfo) => {
      if (!sessionRef.current.me)
        return notify.create('error', 'You are not in this game');
      if (info.type === 'hand-card') {
        if (!id)
          return notify.create('error', 'Could not find meld');
        addToPrivateMeld(id, info.data);
      }
    };
  };

  const playerReady = () => {
    ws.send(setReady(session.id, session.me!.id));
  };

  const newPrivateMeld = () => {
    setMelds(melds => [...melds, { id: uuid(), cards: [] }]);
  };

  const addToPrivateMeld = (id: string, card: Card) => {
    setMelds(melds => melds.map(meld => meld.id === id ? { ...meld, cards: [...meld.cards, card] } : meld));
  };

  const removeFromPrivateMeld = (id: string, card: Card) => {
    let res = melds.map(meld => meld.id === id ? { ...meld, cards: meld.cards.filter(c => c !== card) } : meld);
    res = res.filter(meld => meld.cards.length > 0);
    setMelds(res);
  };

  const findPrivateMeldId = (card: Card) => {
    const meld = melds.find(meld => meld.cards.some(x => x.id === card.id));
    return meld ? meld.id : undefined;
  };

  const privateMeldsContainCard = (card: Card) => {
    return melds.some(meld => meld.cards.some(c => c === card));
  };
  
  const submitMelds = () => {
    if (!session.me)
      return notify.create('error', 'You are not in this game');
    const config: MeldConfig = { type: 'set', length: 1 };
    ws.send(meldCards(session.id, session.me.id, melds.map(x => ({ cards: x.cards, config }))));
    setMelds([]);
  };

  return (
    <div className={s.game}>
      <SlideButton text='Set Ready' icon={solid('user-check')}
        xOffset='2.9em' yOffset='3em' onClick={playerReady}
        attention={session.state === 'round-end' && session.me?.isReady === false}
      />
      <SlideButton text='Add Meld' icon={solid('clone')}
        xOffset='2.5em' yOffset='6em'
        onClick={newPrivateMeld}
      />
      <SlideButton text='Confirm Melds' icon={solid('object-group')}
        xOffset='2.5em' yOffset='9em'
        onClick={submitMelds}
      />
      <SlideButton text='Classic Theme' icon={solid('heart')}
        xOffset='2.5em' yOffset='12em'
        onClick={() => dispatch(themeActions.setTheme('classic'))}
      />
      <SlideButton text='Chess Theme' icon={solid('chess-board')}
        xOffset='2.3em' yOffset='15em'
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
        {session.config.rounds[session.round - 1].melds.map((config, i) => (
          <div key={i}>{config.type} of {config.length}</div>
        ))}
      </div>

      {/*-----------------------------------------------------------------------*/}

      <MessageLog messages={messages} className={s.log} />

      {/*-----------------------------------------------------------------------*/}

      <div className={s.decks}>
        <Reposition>
          <div className='inner'>
            <DiscardPile size={deckSize} discard={session.discard} onDrop={onDiscardDrop} />
            <DrawPile size={deckSize} amount={session.deckCardAmount} />
          </div>
        </Reposition>
      </div>

      {/*-----------------------------------------------------------------------*/}

      {/* <div className={s.privateMelds}>
        <Reposition innerClass='drag'>
          {session.me?.melds.map((meld, i) => (
            <MeldCards key={i} meld={meld} player={session.players.find(x => x.id === session.me?.id)!} />
          ))}
        </Reposition>
      </div> */}

      {/*-----------------------------------------------------------------------*/}

      <div style={{ position: 'absolute', left: '20vw', top: '15vh' }}>
        {melds.map((meld, i) => (
          <MeldContainer
            key={i}
            meld={meld}
            size='20px'
            onDrop={onPrivateMeldAdd(meld.id)}
          />
        ))}
      </div>

      {/*-----------------------------------------------------------------------*/}

      <div className={s.hand} style={{ '--size': fan.size } as CSSProperties}>
        <DropArea className={s.handDrop} onDrop={onDraw}>
          <div className='inner'>
            <CardFan
              {...fan}
              drag
              cards={sortCards([...session.me!.cards]).filter(x => !privateMeldsContainCard(x))}
              newCards={session.me!.newCards}
              cardType='hand-card'
            />
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

    '& > div::first-letter': {
      textTransform: 'uppercase',
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
    pointerEvents: 'none',

    '& .inner': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      pointerEvents: 'initial',
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

// const deck = shuffle(generateDeck(2, 4));
// const session: SessionPublic = {
//   id: '123',
//   name: 'test',
//   config: defaultConfig,
//   currentPlayerId: 'asd',
//   players: [{
//     id: 'asd',
//     name: 'test',
//     isReady: false,
//     cardAmount: 5,
//     melds: [],
//     points: 129,
//     remainingShouts: 3,
//     tempCards: [],
//     playtime: 420000,
//   }, {
//     id: 'asd2',
//     name: 'test2',
//     isReady: false,
//     cardAmount: 11,
//     melds: [],
//     points: 74,
//     remainingShouts: 3,
//     tempCards: [],
//     playtime: 90000,
//   }],
//   round: 1,
//   state: 'turn-start',
//   turn: 1,
//   deckCardAmount: deck.length,
//   turnStartTime: Date.now(),
//   discard: {
//     top: deck.slice(20, 21)[0],
//     bottom: deck.slice(21, 22)[0],
//   },

//   me: {
//     id: 'asd',
//     name: 'test',
//     isReady: false,
//     melds: [{ cards: deck.slice(50, 57), config: { type: 'straight', length: 5 } },
//     { cards: deck.slice(57, 60), config: { type: 'set', length: 3 } },
//     { cards: deck.slice(60, 64), config: { type: 'straight', length: 4 } },
//     ],
//     points: 129,
//     remainingShouts: 3,
//     tempCards: [],
//     newCards: deck.slice(0, 2),
//     cards: deck.slice(0, 5),
//     playtime: 420000,
//   }
// };
