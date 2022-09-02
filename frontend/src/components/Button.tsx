import { createUseStyles } from 'react-jss';
import cx from 'classnames';
import { useEffect, useState } from 'react';

type Props = {
  text: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  onBlur?: React.FocusEventHandler<HTMLButtonElement>;
  autoFocus?: boolean;
  disabled?: boolean;
  id?: string;
  innerRef?: React.MutableRefObject<any>;
  tabIndex?: number;
};

export function Button(p: Props) {
  const s = useStyles();
  const [down, setDown] = useState(false);
  const [timeout, setTimeoutId] = useState<any>();
  
  useEffect(() => {
    return () => clearTimeout(timeout);
  }, [timeout]);

  const mouseDown: React.MouseEventHandler<HTMLButtonElement> = () => {
    setDown(true);
    const id = setTimeout(() => {
      setDown(false);
    }, 200);
    setTimeoutId(id);
  };

  const focus: React.FocusEventHandler<HTMLButtonElement> = e => {
    if (down) {
      setDown(false);
      clearTimeout(timeout);
    } else {
      p.onFocus && p.onFocus(e);
    }
  };

  return (
    <button
      autoFocus={p.autoFocus}
      id={p.id}
      className={cx(s.button, p.className)}
      onMouseDown={mouseDown}
      onClick={p.onClick}
      onFocus={focus}
      onBlur={p.onBlur}
      disabled={p.disabled}
      tabIndex={p.tabIndex}
      ref={p.innerRef}
    >{p.text}</button>
  );
}

const useStyles = createUseStyles({
  button: {
    ':where(&)': {
      borderRadius: '3px',
      border: '1px solid #eee',
      minWidth: '100px',
      height: '30px',
      padding: '5px 10px',
      cursor: 'pointer',
      color: '#444',
      transition: 'filter 150ms, background 150ms',
      boxShadow: '0px 1px 1px #0005',

      '&:focus-visible': {
        outline: 'none',
        filter: 'brightness(95%)',
        border: '1px solid #aaf',
      },

      '&:hover:not(:active):not(:disabled)': {
        filter: 'brightness(95%)',
      },

      '&:active': {
        filter: 'brightness(103%)',
      },

      '&:disabled': {
        filter: 'contrast(20%)',
        border: 'none',
        cursor: 'not-allowed',
      },
    }
  }
});