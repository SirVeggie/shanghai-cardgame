import { useState } from 'react';
import cx from 'classnames';
import { uuid } from 'shared';
import { createUseStyles } from 'react-jss';

type Options = {
  className?: string;
  ref?: React.MutableRefObject<any>;
};

export function useInput(label: string, type?: string, initial?: string, options?: Options) {
  const defaultValue = initial ?? (type === 'number' ? 0
    : type === 'color' ? '#000000'
      : '');
  const s = useStyles();
  const [value, setValue] = useState(defaultValue);

  const onChange = (e: any) => {
    setValue(e.target.value);
  };

  const reset = () => {
    setValue(defaultValue);
  };

  const set = (value: string) => {
    setValue(value);
  };

  const focus = () => {
    options?.ref?.current?.focus();
  };

  const id = uuid();
  const field = (
    <div className={s.input} key={label}>
      <label htmlFor={id}>{label}</label>
      {type === 'textarea' ? <textarea
        id={id}
        onChange={onChange}
        value={value}
        ref={options?.ref}
        className={cx(options?.className)}
      /> : <input
        id={id}
        type={type}
        onChange={onChange}
        value={value}
        ref={options?.ref}
        className={cx(options?.className)}
      />}
    </div>
  );

  return [
    { ...field, value, reset, set, focus },
    value
  ] as [JSX.Element & { value: string, reset: typeof reset, set: typeof set, focus: typeof focus; }, string];
}

const useStyles = createUseStyles({
  input: {
    '& > :where(textarea, input)': {
      borderRadius: '3px',
      border: '1px solid #cccc',
      width: '200px',
      transition: 'border 200ms',
      boxSizing: 'border-box',
    },

    '& > :where(textarea, input):focus': {
      outline: 'none',
      borderColor: '#aaf',
    },

    '& > :where(textarea)': {
      minHeight: '100px',
      minWidth: '200px',
    },

    '& > :where(input)': {
      height: '25px',
    },

    '& > :where(label)': {
      display: 'block',
      marginBottom: '5px',
    },
  },
});