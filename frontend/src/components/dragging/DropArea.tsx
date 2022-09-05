import { CSSProperties, useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { Coord, uuid } from 'shared';
import { useDropArea } from '../../hooks/useDropArea';
import { DropInfo } from '../../reducers/dropReducer';
import cx from 'classnames';

type Props = {
  size?: Coord;
  onDrop: (info: DropInfo) => void;
  name?: string;
  style?: CSSProperties;
  visible?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function DropArea(p: Props) {
  const s = useStyles(p);
  const drop = useDropArea();
  const ref = useRef<HTMLElement>();
  
  useEffect(() => {
    const id = uuid();
    drop.addDrop({
      id: id,
      name: p.name ?? 'Drop Area',
      func: p.onDrop,
      getArea: () => ref.current!.getBoundingClientRect(),
    });
    
    return () => {
      drop.removeDrop(id);
    };
  }, []);
  
  return (
    <div className={cx(s.holder, p.className)} ref={(ref as any)} style={p.style}>
      {p.children}
    </div>
  );
}

const useStyles = createUseStyles({
  holder: (p: Props) => ({
    backgroundColor: p.visible ? 'grey' : undefined,
    width: p.size?.x,
    height: p.size?.y,
  }),
});