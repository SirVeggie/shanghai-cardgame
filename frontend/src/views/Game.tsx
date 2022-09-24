import cx from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { canDiscard, canDrawDeck, canDrawDiscard, canRevealCard, Card, ERROR_EVENT, getPlayerRoundPoints, INFO_EVENT, MeldAdd, MeldConfig, MESSAGE_EVENT, PlayerPublic, SessionPublic, sortCardsHybrid, sortCardsSets, sortCardsStraights, SYNC_EVENT, uuid } from 'shared';
import { DiscardPile } from '../components/DiscardPile';
import { DrawPile } from '../components/DrawPile';
import { useJoinParams } from '../hooks/useJoinParams';
import { useNotification } from '../hooks/useNotification';
import { useSessionComms } from '../hooks/useSessionComms';
import { DropInfo } from '../reducers/dropReducer';
import { sessionActions } from '../reducers/sessionReducer';
import { RootState } from '../store';
import { addToMeld, allowShanghai, callShanghai, discardCard, drawDeck, drawDiscard, meldCards, revealCard, setReady } from '../tools/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Reposition } from '../components/Reposition';
import { EventMessage, MessageLog } from '../components/MessageLog';
import { SlideButton } from '../components/SlideButton';
import { themeActions } from '../reducers/themeReducer';
import { PrivateMeld } from '../components/PrivateMeld';
import { resetDragAnimations } from '../tools/DOM';
import Draggable from 'react-draggable';
import { PublicMeldSet } from '../components/PublicMeldSet';
import { Hand } from '../components/Hand';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useContextMenu } from '../hooks/useContextMenu';

const prevTouch = {
  time: 0,
};

export function Game() {
  const s = useStyles();
  const dispatch = useDispatch();
  const [params] = useJoinParams();
  const notify = useNotification();
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const session = useSelector((state: RootState) => state.session)!;
  const [melds, setMelds] = useState<PrivateMeld[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [turnModal, setTurnModal] = useState(false);
  const [sortFunc, setSortFunc] = useState<{ f: typeof sortCardsSets; }>({ f: sortCardsSets });

  const context = useContextMenu({
    'New meld': !session.me?.melds.length ? newPrivateMeld : undefined,
    'Confirm melds': !session.me?.melds.length ? submitMelds : undefined,
    'Set ready': session.state === 'round-end' && !session.me?.isReady ? playerReady : undefined,
    'Sort by sets': () => {
      setSortFunc({ f: sortCardsSets });
      setHand(sortCardsSets(session.me!.cards));
    },
    'Sort by straights': () => {
      setSortFunc({ f: sortCardsStraights });
      setHand(sortCardsStraights(session.me!.cards));
    },
    'Sort by hybrid': () => {
      setSortFunc({ f: sortCardsHybrid });
      setHand(sortCardsHybrid(session.me!.cards));
    },
    'Clear melds': !session.me?.melds.length ? () => setMelds([]) : undefined,
  });

  const ws = useSessionComms(params, useCallback(event => {
    if (event.type === ERROR_EVENT)
      log(event.message, 'error');
    if (event.type === MESSAGE_EVENT && event.method === 'log')
      log(event.message, 'info');
    if (event.type === MESSAGE_EVENT && event.method === 'notification')
      notify.create('info', event.message);
    if (event.type === INFO_EVENT && event.event === 'turn-start')
      setTurnModal(true);
    if (event.type === INFO_EVENT && event.event === 'round-end')
      setMelds([]);
    if (event.type === SYNC_EVENT) {
      dispatch(sessionActions.setSession(event.session));
      updateHand(event.session);
    }
  }, [JSON.stringify(hand)]));

  useEffect(() => {
    let oldMelds = JSON.parse(localStorage.getItem('private-melds') || '[]') as PrivateMeld[];
    // remove invalid cards
    oldMelds = oldMelds.map(m => ({ ...m, cards: m.cards.filter(c => session.me?.cards.some(x => x.id === c.id)) }));
    oldMelds = oldMelds.filter(m => m.cards.length);
    setMelds(oldMelds);
    const func = () => context.close();
    window.addEventListener('blur', func);
    return () => window.removeEventListener('blur', func);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('private-melds', JSON.stringify(melds));
  }, [JSON.stringify(melds)]);

  // Initialize hand from session cards
  if (!hand.length && session.me!.cards.length)
    updateHand(session);

  if (melds.length && session.me!.melds.length) {
    // Remove private melds on meld success
    setMelds([]);
  }

  const log = (message: string, type: 'info' | 'error' = 'info') => {
    setMessages(msgs => [{ id: uuid(), type, message }, ...(msgs.slice(0, 25))]);
  };

  const deckSize = 'min(3vh, 30px)';

  let winningPlayer: PlayerPublic | null = session.players.reduce((min, p) => {
    return p.points < min.points ? { points: p.points, player: p } : min;
  }, {
    points: session.players[0].points,
    player: session.players[0],
  }).player;

  if (session.players.some(x => x.id !== winningPlayer!.id && x.points === winningPlayer!.points))
    winningPlayer = null;


  const onHandDrop = (info: DropInfo) => {
    const card = info.data as Card;
    if (!session.me)
      return notify.create('error', 'Oh no! session.me not defined');
    if (info.type === 'deck-card') {
      if (canDrawDeck(session) && !(session.pendingShanghai && !session.discard.bottom))
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
      const id = findPrivateMeldId(card);
      if (!id)
        return notify.create('error', 'Could not find meld');
      removeFromPrivateMeld(id, card);
      resetDragAnimations();

    } else if (info.type === 'hand-card') {
      reorderHand(card, info.pos?.x ?? 1);
    }
  };

  const onDiscardDrop = (info: DropInfo) => {
    const card = info.data as Card | undefined;
    if (!session.me)
      return notify.create('error', 'Oh no! session.me not defined');
    if (info.type === 'hand-card') {
      if (canDiscard(session))
        resetDragAnimations();
      ws.send(discardCard(session.id, session.me.id, card!));

    } else if (info.type === 'deck-card') {
      if (canRevealCard(session))
        resetDragAnimations();
      ws.send(revealCard(session.id, session.me.id));

    } else if (info.type === 'meld-card') {
      const id = findPrivateMeldId(card!);
      if (!id)
        return notify.create('error', 'Could not find meld');
      if (canDiscard(session)) {
        removeFromPrivateMeld(id, card!);
        resetDragAnimations();
      }
      ws.send(discardCard(session.id, session.me.id, card!));
    }
  };

  const onPrivateMeldDrop = (id: string) => {
    return (info: DropInfo) => {
      if (!session.me)
        return notify.create('error', 'Oh no! session.me not defined');
      const pos = info.pos?.x ?? 1;

      if (info.type === 'hand-card') {
        if (!id)
          return notify.create('error', 'Could not find meld');
        removeFromAllMelds(info.data);
        addToPrivateMeld(id, info.data, pos);

      } else if (info.type === 'meld-card') {
        if (!id)
          return notify.create('error', 'Could not find target meld');
        const oldId = findPrivateMeldId(info.data);
        if (!oldId)
          return notify.create('error', 'Could not find source meld');
        if (oldId === id)
          return reorderInPrivateMeld(id, info.data, pos);
        removeFromAllMelds(info.data);
        addToPrivateMeld(id, info.data, pos);
      }
    };
  };

  const onPublicMeldDrop = (info: DropInfo, player: PlayerPublic, index: number, position: MeldAdd['position']) => {
    const card = info.data as Card;
    if (!card?.deck === undefined)
      return notify.create('error', 'Invalid card');
    if (!session.me)
      return notify.create('error', 'Oh no! session.me not defined');
    if (info.type === 'hand-card') {
      resetDragAnimations();
      ws.send(addToMeld(session.id, session.me.id, {
        card,
        meldIndex: index,
        targetPlayerId: player.id,
        position,
      }));
    }
  };

  function playerReady() {
    ws.send(setReady(session.id, session.me!.id));
  }

  function newPrivateMeld() {
    setMelds(melds => [...melds, { id: uuid(), cards: [] }]);
  }

  const addToPrivateMeld = (id: string, card: Card, pos: number) => {
    const meld = melds.find(meld => meld.id === id)!;
    const index = Math.floor(pos * (meld.cards.length + 1));
    meld.cards.splice(index, 0, card);
    setMelds(melds => melds.map(m => m.id === id ? meld : m));
  };

  const removeFromPrivateMeld = (id: string, card: Card) => {
    let res = melds.map(meld => meld.id === id ? { ...meld, cards: meld.cards.filter(c => c !== card) } : meld);
    res = res.filter(meld => meld.cards.length > 0);
    setMelds(res);
  };

  const removeFromAllMelds = (card: Card) => {
    const res = melds
      .map(meld => ({ ...meld, cards: meld.cards.filter(c => c.id !== card.id) }))
      .filter(meld => meld.cards.length > 0)
      .concat(melds.filter(meld => meld.cards.length === 0));
    setMelds(res);
  };

  const reorderInPrivateMeld = (id: string, card: Card, pos: number) => {
    const meld = melds.find(meld => meld.id === id)!;
    const oldIndex = meld.cards.findIndex(c => c.id === card.id);
    const gap = 1 / meld.cards.length;
    const oldPos = oldIndex / meld.cards.length + gap / 2;
    const index = Math.floor(pos < oldPos
      ? (pos + gap / 2) * meld.cards.length
      : (pos - gap / 2) * meld.cards.length);
    meld.cards = meld.cards.filter(c => c.id !== card.id);
    meld.cards.splice(index, 0, card);
    setMelds(melds => melds.map(m => m.id === id ? meld : m));
  };

  const findPrivateMeldId = (card: Card) => {
    const meld = melds.find(meld => meld.cards.some(x => x.id === card.id));
    return meld ? meld.id : undefined;
  };

  const privateMeldsContainCard = (card: Card) => {
    return melds.some(meld => meld.cards.some(c => c.id === card.id));
  };

  function reorderHand(card: Card, pos: number) {
    const oldIndex = hand.findIndex(c => c.id === card.id);
    const gap = 1 / hand.length;
    const oldPos = oldIndex / hand.length + gap / 2;
    const index = Math.floor(pos < oldPos
      ? (pos + gap / 2) * hand.length
      : (pos - gap / 2) * hand.length);
    const newHand = hand.filter(c => c.id !== card.id);
    newHand.splice(index, 0, card);
    setHand(newHand);
  }

  function updateHand(workingSession: SessionPublic) {
    if (!workingSession.me)
      return notify.create('error', 'Oh no! session.me not defined');
    if (hand.length === 0)
      return setHand(sortFunc.f(workingSession.me.cards));
    const newCards = workingSession.me.cards.filter(card => !hand.some(c => c.id === card.id));
    const cards = hand.filter(x => workingSession.me!.cards.some(xx => xx.id === x.id)).concat(newCards);
    setHand(cards);
  }

  function onContext(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 2)
      return context.close();
    e.preventDefault();
    context.open({
      x: e.clientX,
      y: e.clientY,
    });
  }

  function touchContext(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'touch')
      return;
    const oldTime = prevTouch.time;
    prevTouch.time = Date.now();
    if (Date.now() - oldTime > 350)
      return;
    prevTouch.time = 0;

    context.open({
      x: e.clientX,
      y: e.clientY,
    });
  }

  function submitMelds() {
    if (!session.me)
      return notify.create('error', 'Oh no! session.me not defined');
    const config: MeldConfig = { type: 'set', length: 1 };
    ws.send(meldCards(session.id, session.me.id, melds.map(x => ({ cards: x.cards, config }))));
  }

  return (
    <div className={s.game}
      onContextMenu={onContext}
      onClick={context.close}
      onPointerDown={touchContext}
    >
      {context.component}
      <ConfirmationModal
        open={turnModal}
        onInput={() => setTurnModal(false)}
        title='Your turn has started'
        noButtons
        onClick={() => setTurnModal(false)}
      >
        <span className={s.turnMessage}>(click anywhere to continue)</span>
      </ConfirmationModal>

      <div className={s.sideButtons}>
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
            {p.id === winningPlayer?.id && <i><FontAwesomeIcon icon={solid('crown')} size='sm' /></i>}
          </div>))}
        </div>

        <div>
          <i><FontAwesomeIcon icon={solid('user-secret')} /></i>
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
            {session.me?.id === p.id && session.state !== 'round-end' ? ` + ${getPlayerRoundPoints(session.config, session.me)}` : ''}
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
        <div className={s.table} onPointerDown={() => context.close()}>
          <div className='table-handle' />

          <div className={s.publicMelds}>
            {session.players.filter(p => p.melds.length).map(p => (
              <PublicMeldSet
                key={p.id}
                player={p}
                melds={p.melds}
                size='min(3vh, 20px)'
                onDrop={onPublicMeldDrop}
              />
            ))}
          </div>

          {/*-----------------------------------------------------------------------*/}

          <div className={s.privateMelds}>
            {melds.map(meld => (
              <PrivateMeld
                key={meld.id}
                meld={meld}
                size='min(3vh, 30px)'
                onDrop={onPrivateMeldDrop(meld.id)}
              />
            ))}
          </div>

          {/*-----------------------------------------------------------------------*/}

          <div className={s.decks}>
            <Reposition>
              <div className='inner'>
                <DiscardPile
                  size={deckSize}
                  discard={session.discard}
                  shanghai={!!session.pendingShanghai}
                  discarding={session.state === 'turn-start' && session.discardOwner !== session.me?.id}
                  drawing={session.state === 'card-drawn' && session.lastDraw === 'discard' && session.currentPlayerId !== session.me?.id}
                  showButton={!!session.pendingShanghai && session.currentPlayerId === session.me?.id}
                  onAllowShanghai={() => ws.send(allowShanghai(session.id, session.me!.id))}
                  onDrop={onDiscardDrop}
                />
                <DrawPile
                  size={deckSize}
                  amount={session.deckCardAmount}
                  drawing={session.state === 'card-drawn' && session.lastDraw === 'deck'}
                />
              </div>
            </Reposition>
          </div>
s
        </div >
      </Draggable>

      {/*-----------------------------------------------------------------------*/}

      <Hand
        cards={hand.filter(x => !privateMeldsContainCard(x))}
        newCards={session.me!.newCards}
        onDrop={onHandDrop}
      />
    </div >
  );
}

const useStyles = createUseStyles({
  '@keyframes appear': {
    from: {
      opacity: 0,
      transform: 'scale(1.05)',
    },

    to: {
      opacity: 1,
      transform: 'scale(1)',
    },
  },

  game: {
    position: 'relative',
    overflow: 'hidden',
    width: '100vw',
    height: '100vh',
    userSelect: 'none',
    backgroundColor: '#000c',

    animation: '$appear 5s ease',
  },

  sideButtons: {
    position: 'relative',
    zIndex: 2,
  },

  roundInfo: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    left: '50%',
    fontSize: 'min(1.5em, 4vh)',
    background: 'linear-gradient(180deg, #0005, #0000)',
    color: '#ccc',
    border: '2px solid #fff5',
    boxShadow: 'inset 0 0 0.3em #fff3, 0 0.3em 0.5em #0005',
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
    background: 'linear-gradient(-90deg, #0005, #0000)',
    color: '#ccc',
    border: '2px solid #fff5',
    boxShadow: 'inset 0 0 0.3em #fff3, 0 0.3em 0.5em #0005',
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
    width: '20vw',
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
    background: 'linear-gradient(-135deg, #000a, #0000)',
    color: '#ccc',
    border: '2px solid #fff5',
    boxShadow: 'inset 0 0 0.3em #fff3, 0 0.3em 0.5em #0005',
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

      '& > div': {
        flex: '1 0 0px',
      },

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

    '&:active': {
      zIndex: 10,
    },

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

  publicMelds: {
    position: 'absolute',
    left: 'calc(100vw - min(4vh, 30px) * 10)',
    top: '88vh',

    '& > *': {
      position: 'absolute',
    },
  },

  privateMelds: {
    position: 'absolute',
    left: 'calc(100vw - min(4vh, 30px) * 10)',
    top: '88vh',

    '& > div:active': {
      zIndex: 10,
    },
  },

  turnMessage: {
    display: 'block',
    marginTop: -20,
    marginBottom: 5,
    color: '#aaa',
    fontStyle: 'italic',
  },
});
