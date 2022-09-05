import { createUseStyles } from 'react-jss';
import { SessionPublic } from 'shared';

type Props = {
  session: SessionPublic;
  onClick?: () => void;
};

export function SessionCard(p: Props) {
  const s = useStyles();

  return (
    <div className={s.back}>
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
            Round: {p.session.round}<br />
            Turn: {p.session.turn}
          </div>
        </div>
      </div>
    </div>
  );
}

const useStyles = createUseStyles({
  back: {
    flex: '1 1 200px',
    minWidth: 250,
    maxWidth: 300,
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.5)',
    boxSizing: 'border-box',
    backdropFilter: 'blur(7.5px) contrast(50%)',
  },

  card: {
    userSelect: 'none',
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    color: '#111',
    background: 'var(--shade)',
    opacity: 0.75,
    cursor: 'pointer',
  },

  titleBox: {
    display: 'flex',
    paddingTop: 10,

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
    color: '#000',
    fontSize: '1.2em',
    backgroundColor: '#fff',
    minHeight: 80,
    padding: 20,
    flexGrow: 1,

    '&:nth-child(1)': {
      flexDirection: 'column',
      whiteSpace: 'pre-line',
      gap: '10px',
      marginRight: '20px',
    },

    '&:nth-child(2)': {

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