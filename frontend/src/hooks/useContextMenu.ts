import { useCallback, useState } from 'react';

type ContextMenu = {
    id: string;
};

export function useContextMenu() {
    const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
    
    const showContextMenu = useCallback(
        (menu: ContextMenu) => {
        setContextMenu(menu);
        },
        [setContextMenu]
    );
    
    const hideContextMenu = useCallback(() => {
        setContextMenu(null);
    }, [setContextMenu]);
    
    return { contextMenu, showContextMenu, hideContextMenu };
}