import cx from 'classnames';
import { CSSProperties, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { canDiscard, canDrawDeck, canDrawDiscard, canRevealCard, Card, ERROR_EVENT, getPlayerRoundPoints, MeldConfig, MESSAGE_EVENT, sortCards, SYNC_EVENT, uuid } from 'shared';
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
import Draggable from 'react-draggable';

export function Game() {
  const s = useStyles();
  const dispatch = useDispatch();
  const [params] = useJoinParams();
  const notify = useNotification();
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const session = useSelector((state: RootState) => state.session)!;
  const [melds, setMelds] = useState<PrivateMeld[]>([]);

  const ws = useSessionComms(params, event => {
    if (event.type === SYNC_EVENT)
      dispatch(sessionActions.setSession(event.session));
    if (event.type === ERROR_EVENT)
      log(event.message, 'error');
    if (event.type === MESSAGE_EVENT)
      log(event.message, 'info');
  });

  if (melds.length && session.me!.melds.length) {
    // Remove private melds on meld success
    setMelds([]);
  }

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
    if (!session.me)
      return notify.create('error', 'Oh no! session.me not defined');
    if (info.type === 'deck-card') {
      if (canDrawDeck(session))
        resetDragAnimations();
      ws.send(drawDeck(session.id, session.me.id));

    } else if (info.type === 'discard-card') {
      if (session.currentPlayerId !== session.me.id) {
        ws.send(callShanghai(session.id, session.me.id));
      } else {
        if (canDrawDiscard(session))
          resetDragAnimations();
        ws.send(drawDiscard(session.id, session.me.id));
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
    if (!session.me)
      return notify.create('error', 'Oh no! session.me not defined');
    if (info.type === 'hand-card') {
      if (canDiscard(session))
        resetDragAnimations();
      ws.send(discardCard(session.id, session.me.id, info.data));

    } else if (info.type === 'deck-card') {
      if (canRevealCard(session))
        resetDragAnimations();
      ws.send(revealCard(session.id, session.me.id));

    } else if (info.type === 'meld-card') {
      const id = findPrivateMeldId(info.data);
      if (!id)
        return notify.create('error', 'Could not find meld');
      if (canDiscard(session)) {
        removeFromPrivateMeld(id, info.data);
        resetDragAnimations();
      }
      ws.send(discardCard(session.id, session.me.id, info.data));
    }
  };

  const onPrivateMeldAdd = (id: string) => {
    return (info: DropInfo) => {
      if (!session.me)
        return notify.create('error', 'Oh no! session.me not defined');
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
    return melds.some(meld => meld.cards.some(c => c.id === card.id));
  };

  const submitMelds = () => {
    if (!session.me)
      return notify.create('error', 'Oh no! session.me not defined');
    const config: MeldConfig = { type: 'set', length: 1 };
    ws.send(meldCards(session.id, session.me.id, melds.map(x => ({ cards: x.cards, config }))));
  };

  return (
    <div className={s.game}>
      <div className='side-buttons'>
        <SlideButton text='Set Ready' icon={solid('user-check')}
          xOffset='2.9em' yOffset='3em' onClick={playerReady}
          attention={session.state === 'round-end' && session.me?.isReady === false}
        />
        <SlideButton text='Add Meld' icon={solid('clone')}
          xOffset='2.5em' yOffset='6em'
          onClick={newPrivateMeld}
          hide={session.me!.melds.length > 0}
        />
        <SlideButton text='Confirm Melds' icon={solid('object-group')}
          xOffset='2.5em' yOffset='9em'
          onClick={submitMelds}
          hide={session.me!.melds.length > 0}
        />
        <SlideButton text='Classic Theme' icon={solid('heart')}
          xOffset='2.5em' yOffset='12em'
          onClick={() => dispatch(themeActions.setTheme('classic'))}
        />
        <SlideButton text='Chess Theme' icon={solid('chess-board')}
          xOffset='2.3em' yOffset='15em'
          onClick={() => dispatch(themeActions.setTheme('chess'))}
        />
      </div>

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
            <div key={p.id} className={cx('player', session.currentPlayerId === p.id && 'current')}>{p.name}</div>
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

      <Draggable handle='.table-handle' positionOffset={{ x: '-25%', y: '-25%' }}>
        <div className={s.table}>
          <div className='table-handle' />
          {/* <div className='table-size' /> */}

          <div className={s.decks}>
            <Reposition>
              <div className='inner'>
                <DiscardPile size={deckSize} discard={session.discard} onDrop={onDiscardDrop} />
                <DrawPile size={deckSize} amount={session.deckCardAmount} />
              </div>
            </Reposition>
          </div>

          {/*-----------------------------------------------------------------------*/}

          <div style={{ position: 'absolute', left: '40%', top: '40%' }}>
            {melds.map(meld => (
              <MeldContainer
                key={meld.id}
                meld={meld}
                size='min(4vh, 30px)'
                onDrop={onPrivateMeldAdd(meld.id)}
              />
            ))}
          </div>

        </div >
      </Draggable>

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
    userSelect: 'none',
    backgroundColor: '#000',
  },

  roundInfo: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
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
    zIndex: 1,
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
    zIndex: 1,
    width: 'min(20vw, 30vh)',
    maxHeight: '20vh',
    fontSize: 'min(1.5em, 1vw)',
    borderBottom: 'none',
    borderLeft: 'none',
    borderRadius: '0 0.3em 0 0',
  },

  players: {
    position: 'absolute',
    display: 'flex',
    top: 0,
    right: 0,
    zIndex: 1,
    fontSize: 'min(1.5em, 4vh)',
    backgroundColor: '#0005',
    color: '#ccc',
    border: '2px solid #000a',
    borderTop: 'none',
    borderRight: 'none',
    padding: '0.5em 1em 1em 1em',
    borderBottomLeftRadius: '0.5em',
    backdropFilter: 'blur(3px)',

    '& .player': {
      color: '#ccca',

      '&.current': {
        color: '#ccc',
        textDecoration: 'underline',
      },
    },

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

  table: {
    position: 'relative',
    width: '200%',
    height: '200%',
    borderRadius: '5vw',
    boxShadow: 'inset 0 0 25vw 15vw #000a',
    background: 'url("/poker-table-background-tiled.jpg")',
    boxSizing: 'border-box',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    
    '& .table-handle': {
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      borderRadius: '5vw',
      border: '7px dashed #000a',
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
