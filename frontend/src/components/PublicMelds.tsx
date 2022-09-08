import { createUseStyles } from 'react-jss';
import { SessionPublic } from 'shared';

type Props = {
  session: SessionPublic;
};

export function PublicMelds(p: Props) {
  const s = useStyles();
  
  return (
    <div className={s.melds}>
      
    </div>
  );
}

const useStyles = createUseStyles({
  melds: {
    
  }
});