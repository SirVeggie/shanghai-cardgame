import { useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Button } from '../components/Button';
import { FormBase } from '../components/FormBase';
import { Toggle } from '../components/Toggle';
import { useInput } from './useInput';
import { useSelect } from './useSelect';

export type FieldInfo = {
  label: string;
  type: string;
  className?: string;
};

export type SelectInfo = {
  type: 'select';
  label: string;
  className?: string;
  options?: string[];
};

export type FormError = {
  message: string;
  cause: unknown;
};

export type FormValues<T extends string> = Record<T, string>;
export function useForm<T extends string>(title: string, fields: Record<T, FieldInfo | SelectInfo>, onSubmit?: (data: FormValues<T>) => boolean | void) {
  const s = useStyles();
  // eslint-disable-next-line no-empty-function, @typescript-eslint/no-empty-function
  const [open, setOpen] = useState(false);
  const ref = useRef<any>();

  const keys = Object.keys(fields) as T[];
  const states = keys.reduce((obj, key, i) => {
    const field = fields[key] as FieldInfo | SelectInfo;
    const [input] = field.type === 'select'
      ? useSelect(field.label, (field as SelectInfo).options ?? [], undefined, { className: field.className, ref: i === 0 ? ref : undefined })
      : useInput(field.label, field.type, undefined, { className: field.className, ref: i === 0 ? ref : undefined });

    const res = {
      ...obj,
      [key]: input
    };
    return res;
  }, {} as Record<T, ReturnType<typeof useInput>[0]>);

  const reset = () => {
    keys.forEach(key => {
      states[key].reset();
    });
  };

  const submit = () => {
    const data = keys.reduce((obj, key) => {
      const value = states[key].value;
      return {
        ...obj,
        [key]: value
      };
    }, {} as FormValues<T>);

    try {
      onSubmit?.(data);
    } catch (e) {
      return { message: '', cause: e } as FormError;
    }

    setOpen(false);
    return data;
  };

  const setOpenCustom = (state: boolean, initialValues?: Partial<FormValues<T>>) => {
    if (initialValues)
      keys.forEach(key => states[key].set(initialValues[key] ?? ''));
    setOpen(state);

    setTimeout(() => {
      states[keys[0]].focus();
    }, 100);
  };

  const formSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const parentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  const input = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    submit();
  };

  const component = (
    <Toggle on={open}>
      <div className={s.modal} onClick={parentClick}>
        <FormBase onSubmit={formSubmit} className={s.content} glass>
          <h2>{title}</h2>
          {keys.map(key => states[key])}
          <Button text='Submit' onClick={input} />
        </FormBase>
      </div>
    </Toggle>
  );

  return { submit, component, isOpen: open, setOpen: setOpenCustom, reset };
}

const useStyles = createUseStyles({
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  '@keyframes dropIn': {
    from: {
      transform: 'translateY(-1rem)'
    },
    to: {
      transform: 'translateY(0)'
    },
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
    maxHeight: '100vh',
    animation: '$fadeIn 350ms ease',
  },

  content: {
    position: 'relative',
    top: '20%',
    animation: '$dropIn 350ms ease',

    '& > h2': {
      margin: 0,
    },
  }
});