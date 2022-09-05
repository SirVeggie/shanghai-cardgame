import { CSSProperties, ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { DraggableCore, DraggableEventHandler } from 'react-draggable';
import { createUseStyles } from 'react-jss';
import { Coord, lerpCoord } from 'shared';
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
}

export function Draggable(p: Props) {
  const s = useStyles();
  const ref = useRef<HTMLElement>(null);
  const refPos = useRef(undefined as undefined | Coord);
  const refPosTarget = useRef(undefined as undefined | Coord);
  const [drag, setDrag] = useState(false);
  const dropper = useDropArea();

  useEffect(() => {
    if (!drag)
      return;
    const interval = setInterval(() => {
      if (!refPos.current || !refPosTarget.current)
        return;
      const newPos = lerpCoord(refPos.current, refPosTarget.current, 0.1);
      ref.current!.style.transform = `translate(${newPos.x}px, ${newPos.y}px)`;
      refPos.current = newPos;
    }, 5);

    return () => {
      clearInterval(interval);
    };
  }, [drag]);

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
    p.onDrag?.(e, data);
  };
  
  const onStop: DraggableEventHandler = (e, data) => {
    setDrag(false);
    p.onState?.(false);
    
    refPosTarget.current = undefined;
    refPos.current = undefined;
    (ref.current as any).style.transform = 'none';
    p.onStop?.(e, data);
    
    const rect = (p.positionRef?.current ? p.positionRef.current : data.node).getBoundingClientRect();
    const drop: Coord = {
      x: rect.x + (rect.width / 2),
      y: rect.y + (rect.height / 2)
    };
    
    dropper.activate(drop, p.info);
  };

  return (
    <DraggableCore nodeRef={ref}
      onStart={onStart}
      onDrag={onDrag}
      onStop={onStop}
    >
      <div ref={(ref as any)} className={cx(s.draggable, p.className, drag && 'dragging')} style={p.style}>
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

    '&:active, &.dragging': {
      cursor: 'grabbing',
      transition: 'none',
      zIndex: 10
    },
  }
});