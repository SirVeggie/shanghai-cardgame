import { useEffect, useState } from 'react';

export function useTouch() {
    const [touch, setTouch] = useState(false);

    useEffect(() => {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            setTouch(true);
        } else {
            setTouch(false);
        }
    }, []);
    
    return touch;
}