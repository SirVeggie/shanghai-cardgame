import { Fragment } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function GameEnd() {
  const s = useStyles();
  const session = useSelector((state: RootState) => state.session);
  const winner = session?.players.find(p => p.id === session.winnerId);

  return (
    <div className={s.end}>
      <div>
        <h1>Game Over</h1>
        <span>Winner: {winner?.name}</span>
        <div className={s.stats}>
          <div>Player</div>
          <div>Score</div>
          <div>Playtime</div>
          {[...session!.players].sort((a, b) => a.points - b.points).map(p => (
            <Fragment key={p.id}>
              <div>{p.name}</div>
              <div>{p.points}</div>
              <div>{(p.playtime / 1000 / 60).toFixed()} min</div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

const useStyles = createUseStyles({
  end: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#ddd',
    fontSize: 'min(2.5vw, 40px)',
    userSelect: 'none',
    textShadow: '0 0 0.2em #000',

    '& h1': {
      margin: 0,
    },

    '& span': {
      marginLeft: '1em',
    },

    '& > div': {
      backdropFilter: 'blur(3px)',
      background: 'linear-gradient(0deg, #0005, #0000)',
      padding: '0.5em 1em',
      borderRadius: '0.5em',
      border: '2px solid #fff5',
      boxShadow: 'inset 0 0 0.3em #fff5, 0 0.3em 0.5em #0005',
    },
  },

  stats: {
    marginTop: '1em',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    columnGap: '0.5em',
    
    '& > div': {
      
    },
  },
});