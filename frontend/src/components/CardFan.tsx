import { CSSProperties, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { Card, Coord } from 'shared';
import { Draggable } from './dragging/Draggable';
import { PlayingCard } from './cards/PlayingCard';
import cx from 'classnames';

type Props = {
  cards: Card[];
  drag?: boolean;
  angle?: number;
  spacing?: number;
  size?: string | number;
  cardType?: 'hand-card' | 'meld-card';
  newCards?: Card[];
  noHover?: boolean;
};

export function CardFan(p: Props) {
  const s = useStyles();

  const cards = p.cards.map((card, i) => (
    <DragCard
      key={card.id} {...p}
      cardAmount={p.cards.length}
      index={i}
      card={card}
      isNew={p.newCards?.some(x => x.id === card.id)}
      noHover={p.noHover}
    />
  ));

  return (
    <div className={s.fan}>
      {cards}
    </div>
  );
}



type DragCardProps = {
  index: number;
  card: Card;
  cardAmount: number;
  size?: string | number;
  angle?: number;
  spacing?: number;
  drag?: boolean;
  cardType?: 'hand-card' | 'meld-card';
  isNew?: boolean;
  noHover?: boolean;
};

function DragCard(p: DragCardProps) {
  const s = useStyles();
  const ref = useRef<HTMLElement>();

  const delta = p.index - (p.cardAmount - 1) / 2;
  const angle = p.angle ?? 0;
  const offsets = calcOffsets(angle, p.spacing ?? 3, delta);
  const style = {
    fontSize: p.size ?? 30,
    '--pos-x': `${offsets.x}em`,
    '--pos-y': `${offsets.y}em`,
    '--rot': `${delta * angle}deg`,
  } as CSSProperties;

  if (!p.drag)
    return (
      <div className={s.center}>
        <PlayingCard card={p.card} className={cx(s.card, p.noHover && 'noHover')} style={style} size={p.size} />;
      </div>
    );
  return (
    <Draggable positionRef={(ref as any)} info={{ type: p.cardType ?? 'hand-card', data: p.card }} className={s.center}>
      <PlayingCard
        innerRef={(ref as any)}
        pointer
        card={p.card}
        size={p.size}
        className={cx(s.card)}
        style={style}
        isNew={p.isNew}
      />
    </Draggable>
  );
}



const useStyles = createUseStyles({
  fan: {
    display: 'flex',
    position: 'relative',
  },

  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    '--scale': 1,
    '--pos-x': '0px',
    '--pos-y': '0px',
    '--rot': '0deg',

    position: 'absolute',
    transform: 'translate(var(--pos-x), var(--pos-y)) scale(var(--scale)) rotate(var(--rot))',
    transition: 'transform 200ms ease',
    
    '&:not(.noHover):hover': {
      transform: 'translate(var(--pos-x), calc(var(--pos-y))) scale(calc(var(--scale) * 1.1)) rotate(var(--rot)) translateY(-1em)',
    },

    '.dragging &:not(.noHover)': {
      transform: 'translate(var(--pos-x), calc(var(--pos-y))) scale(calc(var(--scale) * 1.1)) translateY(-1em) rotate(0deg)',
    },
  }
});

function calcOffsets(angle: number, distance: number, delta: number): Coord {
  if (!angle)
    return { x: distance * delta, y: 0 };
  const rootAngle = (180 - 90 - (90 - angle)) * 2 * delta;
  const actualAngle = 90 - (180 - rootAngle) / 2;
  const rootDepth = distance / 2 / Math.cos(toRadians(90 - angle));
  const actualDistance = Math.sin(toRadians(rootAngle / 2)) * rootDepth * 2;

  const rad = toRadians(actualAngle);
  return {
    x: Math.cos(rad) * actualDistance,
    y: Math.sin(rad) * actualDistance / 2
  };
}

function toRadians(degrees: number) {
  return degrees * Math.PI / 180;
}