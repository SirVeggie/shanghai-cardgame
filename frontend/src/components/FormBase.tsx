import { createUseStyles } from 'react-jss';
import cx from 'classnames';

type Props = {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children?: React.ReactNode;
  className?: string;
  glass?: boolean;
  color?: string;
};

export function FormBase(p: Props) {
  const s = useStyles(p.color);
  return (
    <form className={cx(s.form, s.values, p.className, p.glass && 'glass')} onSubmit={p.onSubmit}>{p.children}</form>
  );
}

const useStyles = createUseStyles({
  values: (color: string) => ({
    '--color': color ?? '#111',
  }),
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0px 4px 10px #0005',
    flexBasis: 0,
    color: 'var(--color)',

    '&.glass': {
      backgroundColor: '#ddd7',
      backdropFilter: 'blur(10px) saturate(100%) contrast(75%)',

      '& label': {
        // mixBlendMode: 'color-burn',
      },
      
      '& input, & textarea': {
        backgroundColor: '#fff5',
      },
    },
  },
});