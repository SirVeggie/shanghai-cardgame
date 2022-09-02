import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  on: boolean;
  animation?: 'opacity' | 'slide';
};

export function Toggle(p: Props) {
  const [maxHeight, setMaxHeight] = useState(0);
  const [wait, setWait] = useState(true);
  const ref = useRef<any>();
  const s = useStyles(p.animation === 'slide' ? calc(p, maxHeight, wait) : '');
  
  useEffect(() => {
    if (p.animation !== 'slide')
      return;
    setMaxHeight(ref.current.scrollHeight ?? 0);
    setTimeout(() => {
      setWait(false);
    }, 100);
  }, []);

  if (p.animation === 'opacity')
    return <div className={cx(s.opacity, !p.on && 'hidden')}>{p.children}</div>;
  if (p.animation === 'slide')
    return <div className={s.slide} ref={ref}>{p.children}</div>;
  return <>{p.on ? p.children : ''}</>;
}

function calc(p: Props, max: number, wait: boolean) {
  if (!max)
    return 'auto';
  if (p.on || wait)
    return `${max}px`;
  return '0px';
}

const useStyles = createUseStyles({
  values: (height: string) => ({
    '--height': height,
    '--opacity': height !== '0px' ? 1 : 0,
  }),
  
  opacity: {
    transition: 'opacity 0.4s ease',

    '&.hidden': {
      opacity: 0,
      pointerEvents: 'none',
    },
  },
  
  slide: {
    overflow: 'hidden',
    transition: 'height 0.4s ease, opacity 0.2s ease',
    height: 'var(--height)',
    opacity: 'var(--opacity)',
  },
});