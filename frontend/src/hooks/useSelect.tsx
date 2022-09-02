import React, { useRef, useState } from 'react';
import { uuid } from 'shared';
import cx from 'classnames';
import { createUseStyles } from 'react-jss';
import { Button } from '../components/Button';

type Options = {
  className?: string;
  ref?: React.MutableRefObject<any>;
};

export function useSelect(label: string, values: string[], initial?: string, options?: Options) {
  const s = useStyles();
  values = values.length ? values : ['(none)'];
  const defaultValue = initial ?? values[0] ?? '';
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  let ref = useRef<any>();
  ref = options?.ref ?? ref;

  if (values.length !== new Set(values).size) {
    throw new Error('useSelect: options must not contain duplicates');
  }

  if (!values.some(x => x === value))
    setValue(defaultValue);

  //#region handlers
  const setDropdown = (state: boolean) => {
    setOpen(state);
    if (state && !open)
      setIndex(0);
  };

  const set = (value: string) => {
    if (!values.includes(value))
      throw new Error(`useSelect: invalid value: ${value}`);
    setValue(value);
  };

  const reset = () => {
    setValue(defaultValue);
  };

  const focusButton = () => {
    ref.current.focus();
  };

  const click: React.MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault();
    setDropdown(!open);
  };

  const focus: React.FocusEventHandler<HTMLButtonElement> = () => {
    if (!open)
      setDropdown(true);
  };

  const focusElement = () => {
    options?.ref?.current?.focus();
  };

  const blur: React.FocusEventHandler<HTMLDivElement> = e => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropdown(false);
    }
  };
  //#endregion

  const id = uuid();
  const field = (
    <div key={label} className={s.select} onBlur={blur}>
      <label htmlFor={id}>{label}</label>
      <Button
        tabIndex={open ? -1 : undefined}
        innerRef={options?.ref}
        id={id}
        onClick={click}
        onFocus={focus}
        text={value}
        className={cx(s.button, options?.className)}
      />
      <div className={cx(s.drop, open && 'open')}>
        {values.map((option, i) => <SelectButton key={option} option={option} focus={i === index} />)}
      </div>
    </div>
  );

  return [
    { ...field, value, reset, set, focus },
    value
  ] as [JSX.Element & { value: string, reset: typeof reset, set: typeof set, focus: typeof focusElement; }, string];

  function SelectButton(p: ButtonProps) {
    const click = (e: any) => {
      e.preventDefault();
      setValue(p.option);
      setDropdown(false);
      focusButton();
    };

    const onKey: React.KeyboardEventHandler<HTMLButtonElement> = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setDropdown(false);
        focusButton();
      } else if (e.key === 'ArrowDown') {
        e.stopPropagation();
        e.preventDefault();
        setIndex(Math.min(index + 1, values.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.stopPropagation();
        e.preventDefault();
        setIndex(Math.max(index - 1, 0));
      }
    };

    return (
      <button tabIndex={-1} autoFocus={p.focus} onClick={click} onKeyDown={onKey} className='dropdown-option'>
        {p.option}
      </button>
    );
  }
}

type ButtonProps = {
  option: string;
  focus?: boolean;
};

const useStyles = createUseStyles({
  select: {
    ':where(&)': {
      position: 'relative',
    },

    '& > :where(label)': {
      display: 'block',
      marginBottom: '5px',
    },
  },

  drop: {
    '--border': '1px',
    display: 'none',
    borderRadius: '3px',
    border: 'var(--border) solid #eee',
    position: 'absolute',
    backgroundColor: '#fff',
    width: '200px',
    boxSizing: 'border-box',
    maxHeight: 'calc(180px + var(--border) * 2)',
    overflowY: 'auto',
    zIndex: 1,

    '&.open': {
      display: 'flex',
      flexDirection: 'column',
    },

    '& > button': {
      cursor: 'pointer',
      padding: '0 10px',
      minHeight: '30px',
      border: 'none',
      backgroundColor: '#fff',
      textAlign: 'left',
      color: '#555',
      outline: 'none',

      '&:hover': {
        backgroundColor: '#f5f5f5',
      },

      '&:focus:not(:hover)': {
        backgroundColor: '#f8f8ff',
      },
    },
  },

  button: {
    width: 200,
    textAlign: 'left',
    padding: '0 10px',
    position: 'relative',
    boxShadow: '0px 1px 1px #0003',

    '&::after': {
      fontFamily: '"Font Awesome 5 Free"',
      fontWeight: 900,
      content: '"\\f0d7"',
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'black',
      top: 0,
      bottom: 0,
      right: 0,
      width: 30,
    },
  }
});