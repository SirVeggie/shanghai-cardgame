import { CSSProperties, ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { createUseStyles } from 'react-jss';
import { Coord } from 'shared';
import { useDropArea } from '../../hooks/useDropArea';
import cx from 'classnames';
import { DropInfo } from '../../reducers/dropReducer';

type Props = {
  info: DropInfo;
  positionRef?: RefObject<HTMLElement>;
  onStart?: DraggableEventHandler;
  onDrag?: DraggableEventHandler;
  onStop?: DraggableEventHandler;
  onState?: (drag: boolean) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Draggable(p: Props) {
  const s = useStyles();
  const ref = useRef<HTMLElement>(null);
  const refPos = useRef(undefined as undefined | Coord);
  const refPosTarget = useRef(undefined as undefined | Coord);
  const [drag, setDrag] = useState(false);
  const [dropped, setDropped] = useState({ state: false, timeout: 0 });
  const dropper = useDropArea();

  useEffect(() => {
    return () => {
      clearTimeout(dropped.timeout);
    };
  }, []);
  
  const onStart: DraggableEventHandler = (e, data) => {
    setDrag(true);
    p.onState?.(true);

    if (refPos.current === undefined)
      refPos.current = { x: 0, y: 0 };
    refPosTarget.current = refPos.current;
    p.onStart?.(e, data);
  };

  const onDrag: DraggableEventHandler = (e, data) => {
    refPosTarget.current!.x += data.deltaX;
    refPosTarget.current!.y += data.deltaY;
    refPos.current = refPosTarget.current;
    ref.current!.style.transform = `translate(${refPos.current!.x}px, ${refPos.current!.y}px)`;
    p.onDrag?.(e, data);
  };

  const onStop: DraggableEventHandler = (e, data) => {
    const timeout = setTimeout(() => {
      setDropped({ state: false, timeout: 0 });
    }, 500);
    setDropped({ state: true, timeout: timeout as any });

    setDrag(false);
    p.onState?.(false);

    refPosTarget.current = undefined;
    refPos.current = undefined;
    (ref.current as any).style.transform = 'none';

    setTimeout(() => {
      p.onStop?.(e, data);
    }, 10);

    const rect = (p.positionRef?.current ? p.positionRef.current : data.node).getBoundingClientRect();
    const drop: Coord = {
      x: rect.x + (rect.width / 2),
      y: rect.y + (rect.height / 2)
    };

    dropper.activate(drop, p.info);
  };

  const style = {
    zIndex: drag ? 10 : 0,
    ...p.style,
  } as CSSProperties;

  return (
    <DraggableCore nodeRef={ref}
      onStart={onStart}
      onDrag={onDrag}
      onStop={onStop}
    >
      <div ref={(ref as any)} className={cx(s.draggable, 'draggable', p.className, drag && 'dragging', dropped.state && 'dropped')} style={style}>
        {p.children}
      </div>
    </DraggableCore>
  );
}

const useStyles = createUseStyles({
  draggable: {
    '--pos-x': '0px',
    '--pos-y': '0px',
    transition: 'transform 500ms ease',
    transform: 'translate(var(--pos-x), var(--pos-y))',
    cursor: 'grab',

    '&.hidden': {
      opacity: 0,
    },
    
    '&.no-transition': {
      transition: 'none'
    },

    '&:active, &.dragging': {
      position: 'relative',
      cursor: 'grabbing',
      transition: 'none',
      zIndex: 10
    },
  }
});