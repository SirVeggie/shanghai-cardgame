import { createUseStyles } from 'react-jss';
import { SessionPublic } from 'shared';
import { Toggle } from './Toggle';

type Props = {
  session: SessionPublic;
  onClick?: () => void;
};

export function SessionCard(p: Props) {
  const s = useStyles();

  return (
    <div className={s.card} onClick={p.onClick}>
      <div className={s.titleBox}>
        <h1>{p.session.name}</h1>
      </div>
      <div className={s.inner}>
        <div>
          Players:<br />
          {p.session.players.map(player => <div key={player.id}>{player.name}</div>)}
        </div>
        <div>
          <Toggle on={p.session.state !== 'game-end'}>
            Round: {p.session.round}/{p.session.config.rounds.length}<br />
            Turn: {p.session.turn}
          </Toggle>
          <Toggle on={p.session.state === 'game-end'}>
            Game Over<br />
            Winner:<br />
            {p.session.players.find(x => x.id === p.session.winnerId)?.name}
          </Toggle>
        </div>
      </div>
    </div>
  );
}

const useStyles = createUseStyles({
  back: {
    backdropFilter: 'blur(7.5px) contrast(50%)',
  },

  card: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxSizing: 'border-box',
    boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.5)',
    borderRadius: '10px',
    flex: '1 1 200px',
    minWidth: 250,
    maxWidth: 300,
    userSelect: 'none',
    cursor: 'pointer',
    backdropFilter: 'blur(2px)',
    transition: 'transform 250ms ease, box-shadow 250ms ease',

    '&:hover': {
      // transform: 'scale(1.05)',
      transform: 'translateY(-5px)',
      boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.5)',
    },
  },

  titleBox: {
    display: 'flex',
    paddingTop: 10,
    color: '#ddd',
    backgroundColor: '#222',
    borderRadius: '10px 10px 0 0',

    '& > h1': {
      fontSize: '1.5em',
      margin: '0 10px 10px 20px',
      flexGrow: 1,
    },
  },

  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    color: '#ddd',
    fontSize: '1.2em',
    backgroundColor: '#0003',
    minHeight: 80,
    padding: 20,
    flexGrow: 1,
    border: '1px solid #fff5',
    borderTop: 'none',
    borderRadius: '0 0 10px 10px',

    '&:nth-child(1)': {
      flexDirection: 'column',
      whiteSpace: 'pre-line',
      gap: '10px',
      marginRight: '20px',
    },
  },

  type: {
    fontSize: '0.8em',
    marginRight: '10px',
    color: '#eee',
    textShadow: '0px 2px 3px #000c',
    whiteSpace: 'nowrap',
  }
});