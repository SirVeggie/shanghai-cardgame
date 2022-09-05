import { createUseStyles } from 'react-jss';

type Props = {
  size?: string | number;
};

export function DummyCard(p: Props) {
  const s = useStyles();
  
  return (
    <div className={s.dummy} style={{ fontSize: p.size }}>
      
    </div>
  );
}

const useStyles = createUseStyles({
  dummy: {
    fontSize: '30px',
    width: '5em',
    height: '8em',
  }
});