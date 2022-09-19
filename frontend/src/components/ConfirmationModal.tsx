import { createUseStyles } from 'react-jss';
import cx from 'classnames';
import { Toggle } from './Toggle';

export type ConfirmationModalProps = {
  open: boolean;
  onInput: (value: boolean) => void;
  title?: string;
  text?: string;
  warning?: boolean;
  children?: React.ReactNode;
  noButtons?: boolean;
  yesNo?: boolean;
  onClick?: () => void;
};

export function ConfirmationModal(p: ConfirmationModalProps) {
  const s = useStyles();

  const title = p.title ?? 'Are you sure?';
  const message = p.text ?? '';

  const parentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.target === e.currentTarget)
      p.onInput(false);
  };
  
  const input = (input: boolean) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      p.onInput(input);
    };
  };

  return (
    <Toggle on={p.open}>
      <div className={s.modal} onClick={parentClick}>
        <div className={cx(s.content, p.warning && 'warning')} onClick={p.onClick}>
          <h2>{title}</h2>
          {message && <p>{message}</p>}

          <Toggle on={!!p.children}>
            <div className={s.custom}>
              {p.children}
            </div>
          </Toggle>

          <Toggle on={!p.noButtons}>
            <div className={s.buttons}>
              <button className={cx(s.button, p.warning ? 'danger' : 'accept')} onClick={input(true)}>{p.yesNo ? 'Yes' : 'Ok'}</button>
              <button className={s.button} onClick={input(false)}>{p.yesNo ? 'No' : 'Cancel'}</button>
            </div>
          </Toggle>

        </div>
      </div>
    </Toggle>
  );
}

const useStyles = createUseStyles({
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '@keyframes dropIn': {
    from: { transform: 'translateY(-1rem)' },
    to: { transform: 'translateY(0)' },
  },

  modal: {
    position: 'fixed',
    cursor: 'initial',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start',
    zIndex: 2000,
    animation: '$fadeIn 350ms ease',
  },

  content: {
    position: 'relative',
    top: '20%',
    pointerEvents: 'auto',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '5px',
    minWidth: '400px',
    maxWidth: '80%',
    maxHeight: '80%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundOrigin: 'border-box',
    animation: '$dropIn 350ms ease',

    '& > h2': {
      marginTop: 0,
    },
    
    '&.warning': {
      border: '2px solid #ffe640',
    },
  },

  custom: {
    // width: '100%',
  },

  buttons: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },

  button: {
    padding: '10px',
    color: '#777',
    borderRadius: '5px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    cursor: 'pointer',
    width: '100px',

    '&.danger': {
      borderColor: '#faa',
      color: '#faa',
    },
    
    '&.accept': {
      borderColor: '#aaf',
      color: '#aaf',
    },

    '&:hover': {
      backgroundColor: '#eee',
    },

    '&:active': {
      backgroundColor: '#ddd',
    }
  }
});