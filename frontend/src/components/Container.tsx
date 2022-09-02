import cx from 'classnames';
import { createUseStyles } from 'react-jss';
import { contMinWidth } from '../tools/cssConst';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Container(p: Props) {
  const s = useStyles();

  return (
    <div className={cx(s.container, p.className)}>
      <div className='inner'>
        {p.children}
      </div>
    </div>
  );
}

const useStyles = createUseStyles({
  container: {
    ':where(&)': {
      display: 'flex',
      justifyContent: 'center',
    },
    
    ':where(&) .inner': {
      padding: '0px 20px',
      minWidth: 700,
      maxWidth: 1000,
      boxSizing: 'border-box',
      '--media-width': '700px',

      [`@media (max-width: ${contMinWidth})`]: {
        minWidth: 'calc(100%)',
      }
    },
  }
});