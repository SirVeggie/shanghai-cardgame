import { CSSProperties, useState } from 'react';
import { createUseStyles } from 'react-jss';
import cx from 'classnames';
import { Coord } from 'shared';

export function useContextMenu(options: Record<string, (() => void) | undefined>) {
    const s = useStyle();
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<Coord>({ x: 0, y: 0 });

    const style = {
        '--x': `${position.x + 5}px`,
        '--y': `${position.y}px`,
    } as CSSProperties;

    const index = (i: number) => ({
        '--index': i
    } as CSSProperties);

    const component = (
        <div className={cx(s.context, open && 'open')} style={style}>
            {Object.keys(options).filter(x => options[x]).map((option, i) => (
                <div
                    key={i}
                    style={index(i)}
                    onClick={options[option]}
                >{option}</div>
            ))}
        </div>
    );

    const setState = (state: boolean, pos: Coord) => {
        setPosition(pos);
        setOpen(state);
    };

    return {
        component,
        open: (pos: Coord) => setState(true, pos),
        close: () => setState(false, { x: 0, y: 0 }),
        setOpen: setState,
        isOpen: open,
    };
}

const useStyle = createUseStyles({
    '@keyframes open': {
        '0%': {
            opacity: 0,
            transform: 'scale(0.7)',
        },
        '100%': {
            opacity: 1,
            transform: 'scale(1)',
        },
    },

    '@keyframes stagger': {
        '0%': {
            opacity: 0,
            transform: 'translateX(-10px)',
        },
        '100%': {
            opacity: 1,
            transform: 'translateX(0)',
        },
    },

    context: {
        position: 'absolute',
        transformOrigin: 'top left',
        zIndex: 100,
        top: 'var(--y)',
        left: 'var(--x)',
        pointerEvents: 'none',
        color: '#ddd',
        background: 'linear-gradient(0deg, #0009, #0005)',
        backdropFilter: 'blur(3px)',
        border: '1px solid #fff5',
        minWidth: '10em',
        borderRadius: '0.5em',
        boxShadow: 'inset 0 0 0.3em #fff5, 0 0.3em 0.5em #0005',
        opacity: 0,
        overflow: 'hidden',

        '&.open': {
            pointerEvents: 'auto',
            opacity: 1,
            animation: '$open 0.3s ease',
        },

        '& > div:not(:last-child)': {
            borderBottom: '1px solid #0003',
        },

        '&.open > div': {
            animation: '$stagger 0.3s ease backwards',
            animationDelay: 'calc(var(--index) * 0.1s)',
        },

        '& > div': {
            padding: '0.5em 1em',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',

            '&:hover': {
                backgroundColor: '#000a',
            },
        },
    },
});