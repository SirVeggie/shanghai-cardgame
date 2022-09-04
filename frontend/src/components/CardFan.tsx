import { CSSProperties } from 'react';
import { createUseStyles } from 'react-jss';
import { Card, Coord } from 'shared';
import { Draggable } from './dragging/Draggable';
import { PlayingCard } from './PlayingCard';

type Props = {
  cards: Card[];
  drag?: boolean;
  angle?: number;
  spacing?: number;
  size?: string | number;
};

export function CardFan(p: Props) {
  const s = useStyles();

  const cards = p.cards.map((card, i) => {
    const delta = i - (p.cards.length - 1) / 2;
    const angle = p.angle ?? 0;
    const offsets = calcOffsets(angle, p.spacing ?? 3, delta);
    const style = {
      fontSize: p.size ?? 30,
      '--pos-x': `${offsets.x}em`,
      '--pos-y': `${offsets.y}em`,
      '--rot': `${delta * angle}deg`,
    } as CSSProperties;

    if (!p.drag)
      return <PlayingCard card={card} className={s.card} style={style} size={p.size} />;
    return (
      <div key={card.id} className={s.card} style={style}>
        <Draggable info={{ type: 'card', data: card }}>
          <PlayingCard card={card} size={p.size} />
        </Draggable>
      </div>
    );
  });

  return (
    <div className={s.fan}>
      {cards}
    </div>
  );
}

const useStyles = createUseStyles({
  fan: {
    display: 'flex',
    position: 'relative',
  },

  card: {
    '--scale': 1,
    '--pos-x': '0px',
    '--pos-y': '0px',
    '--rot': '0deg',

    position: 'absolute',
    transform: 'translate(var(--pos-x), var(--pos-y)) scale(var(--scale)) rotate(var(--rot))',
    transition: 'transform 200ms ease',

    '&:hover': {
      transform: 'translate(var(--pos-x), calc(var(--pos-y))) scale(calc(var(--scale) * 1.1)) rotate(var(--rot)) translateY(-1em)',
    },

    '&:active': {
      transform: 'translate(var(--pos-x), calc(var(--pos-y))) scale(calc(var(--scale) * 1.1)) rotate(0deg) translateY(-1em)',
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