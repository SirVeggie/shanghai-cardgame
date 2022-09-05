import { CSSProperties, MouseEventHandler } from 'react';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

type Props = {
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
  size?: string | number;
  style?: CSSProperties;
  pointer?: boolean;
}

export function EmptyCard(p: Props) {
  const s = useStyles();
  
  const style = {
    ...p.style,
    fontSize: p.size ?? 30,
    cursor: p.onClick || p.pointer ? 'pointer' : 'default',
  };
  
  return (
    <div className={cx(s.empty, p.className)} style={style}>
      <FontAwesomeIcon icon={solid('xmark')} size='3x' opacity={0.2} />
    </div>
  );
}

const useStyles = createUseStyles({
  empty: {
    fontSize: '30px',
    width: '5em',
    height: '8em',
    borderRadius: '0.3em',
    border: '2px dashed #0005',
    background: '#0002',
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
    '&::after': {
      content: '""',
      position: 'absolute',
      border: '1px dashed #0003',
      inset: '0.25em',
      borderRadius: '0.15em',
    },
  }
});