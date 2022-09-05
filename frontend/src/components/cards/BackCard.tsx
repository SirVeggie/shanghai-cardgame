import { CSSProperties, MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';

type Props = {
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
  size?: string | number;
  style?: CSSProperties;
  pointer?: boolean;
  hover?: boolean;
};

export function BackCard(p: Props) {
  const s = useStyles();

  const style = {
    ...p.style,
    fontSize: p.size ?? 30,
    cursor: p.onClick || p.pointer ? 'pointer' : 'default',
  };

  return (
    <div className={cx(s.empty, p.className, p.hover && 'hover')} style={style}>

    </div>
  );
}

const useStyles = createUseStyles({
  empty: {
    fontSize: '30px',
    width: '5em',
    height: '8em',
    borderRadius: '0.3em',
    border: '1px solid #0003',
    boxSizing: 'border-box',
    backgroundClip: 'content-box',
    userSelect: 'none',
    filter: 'drop-shadow(4px 4px 5px #0009)',
    overflow: 'hidden',
    
    '&.hover': {
      transition: 'transform 200ms ease',
      
      '&:hover': {
        transform: 'translateY(-0.5em) scale(1.05)',
      },
    },

    '--color1': '#9caea9',
    '--color2': '#788585',
    '--color3': '#38302e',
    background: `
      linear-gradient(30deg, var(--color1) 12%, transparent 12.5%, transparent 87%, var(--color1) 87.5%, var(--color1)),
      linear-gradient(150deg, var(--color1) 12%, transparent 12.5%, transparent 87%, var(--color1) 87.5%, var(--color1)),
      linear-gradient(30deg, var(--color1) 12%, transparent 12.5%, transparent 87%, var(--color1) 87.5%, var(--color1)),
      linear-gradient(150deg, var(--color1) 12%, transparent 12.5%, transparent 87%, var(--color1) 87.5%, var(--color1)),
      linear-gradient(60deg, var(--color2) 25%, transparent 25.5%, transparent 75%, var(--color2) 75%, var(--color2)),
      linear-gradient(60deg, var(--color2) 25%, transparent 25.5%, transparent 75%, var(--color2) 75%, var(--color2)),
      var(--color3)`,
    '--size1': 'calc(20 * 1em * 0.037)',
    '--size2': 'calc(35 * 1em * 0.037)',
    backgroundSize: 'calc(var(--size1) * 2) calc(var(--size2) * 2)',
    backgroundPosition: '0 0, 0 0, var(--size1) var(--size2), var(--size1) var(--size2), 0 0, var(--size1) var(--size2)',

    // position: 'relative',

    // '&::after': {
      // content: '""',
      // position: 'absolute',
      // border: '1px dashed #0003',
      // inset: '0.25em',
      // borderRadius: '0.15em',
    // },
  }
});