import { useEffect, useState } from 'react';

export function useMobile() {
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        const updateMobile = () => {
            setMobile(window.innerWidth < 600);
        };

        updateMobile();
        window.addEventListener('resize', updateMobile);

        return () => {
            window.removeEventListener('resize', updateMobile);
        };
    }, []);

    return mobile;
}