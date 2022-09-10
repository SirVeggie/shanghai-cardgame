import { useDispatch, useSelector } from 'react-redux';
import { Coord } from 'shared';
import { Drop, dropActions, DropInfo } from '../reducers/dropReducer';
import { RootState } from '../store';

export function useDropArea() {
    const dispatch = useDispatch();
    const drops = useSelector((state: RootState) => state.drops);

    const addDrop = (drop: Drop) => {
        dispatch(dropActions.addDrop(drop));
    };

    const removeDrop = (id: string) => {
        dispatch(dropActions.removeDrop(id));
    };

    const activate = (pos: Coord, info: DropInfo): string[] => {
        const found = find(pos);
        found.forEach((x, i) => {
            const area = x.getArea();
            x.func({
                pos: {
                    x: (pos.x - area.x) / area.width,
                    y: (pos.y - area.y) / area.height,
                },
                layer: i,
                ...info
            });
        });
        return found.map(x => x.id);
    };

    const find = (pos: Coord): Drop[] => {
        return drops.filter(drop => {
            const area = drop.getArea();
            return area.x <= pos.x
                && area.x + area.width > pos.x
                && area.y <= pos.y
                && area.y + area.height > pos.y;
        });
    };

    return {
        drops,
        find,
        addDrop,
        removeDrop,
        activate,
    };
}