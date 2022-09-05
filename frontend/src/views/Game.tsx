import { CSSProperties } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { ctool, defaultConfig, ERROR_EVENT, generateDeck, MESSAGE_EVENT, SessionPublic, shuffle, SYNC_EVENT } from 'shared';
import { CardFan } from '../components/CardFan';
import { DiscardPile } from '../components/DiscardPile';
import { DrawPile } from '../components/DrawPile';
import { useJoinParams } from '../hooks/useJoinParams';
import { useNotification } from '../hooks/useNotification';
import { useSessionComms } from '../hooks/useSessionComms';
import { DropInfo } from '../reducers/dropReducer';
import { sessionActions } from '../reducers/sessionReducer';
import { RootState } from '../store';

export function Game() {
  const s = useStyles();
  const dispatch = useDispatch();
  const [params] = useJoinParams();
  const notify = useNotification();
  // const session = useSelector((state: RootState) => state.session)!;

  const ws = useSessionComms(params, event => {
    if (event.type === SYNC_EVENT)
      dispatch(sessionActions.setSession(event.session));
    if (event.type === ERROR_EVENT)
      notify.create('error', event.message);
    if (event.type === MESSAGE_EVENT)
      notify.create('info', event.message);
  });

  const fan = {
    angle: 5 / (session.me!.cards.length * 0.1),
    size: '2vw',
    spacing: Math.min(3, 3 / (session.me!.cards.length * 0.07)),
  };

  const onDiscard = (info: DropInfo) => {
    notify.create('info', `You discarded ${ctool.longName(info.data)}`);
  };

  return (
    <div className={s.game}>

      <div className={s.decks}>
        <DiscardPile discard={session.discard} onDrop={onDiscard} />
        <DrawPile amount={session.deckCardAmount} />
      </div>

      <div className={s.hand} style={{ '--size': '2vw' } as CSSProperties}>
        <CardFan drag cards={session.me!.cards} {...fan} cardType='hand-card' />
      </div>
    </div>
  );
}

const useStyles = createUseStyles({
  game: {
    position: 'relative',
    overflow: 'hidden',
    width: '100vw',
    height: '100vh',
  },

  decks: {
    display: 'flex',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    '& > :first-child': {
      marginRight: '1em',
    }
  },

  hand: {
    position: 'absolute',
    bottom: 'calc(var(--size) * 8)',
    left: '50%',
  },
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
    melds: [],
    points: 0,
    remainingShouts: 3,
    tempCards: [],
  }, {
    id: 'asd2',
    name: 'test2',
    isReady: false,
    melds: [],
    points: 0,
    remainingShouts: 3,
    tempCards: [],
  }],
  round: 1,
  state: 'turn-start',
  turn: 1,
  deckCardAmount: deck.length,
  discard: {
    top: deck.slice(20, 21)[0],
    bottom: deck.slice(21, 22)[0],
  },

  me: {
    id: 'asd',
    name: 'test',
    isReady: false,
    melds: [],
    points: 0,
    remainingShouts: 3,
    tempCards: [],
    newCards: deck.slice(0, 2),
    cards: deck.slice(0, 11),
  }
};
