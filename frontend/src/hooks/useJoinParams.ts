import { useEffect, useState } from 'react';
import { GameJoinParams, validateJoinParams } from 'shared';

export function useJoinParams() {
    const [params, setParams] = useState<GameJoinParams>();

    useEffect(() => {
        try {
            const params = JSON.parse(localStorage.getItem('joinParams') ?? '{}') as GameJoinParams;
            validateJoinParams(params);
            setParams(params);
        } catch {
            console.log('Failed to get params from memory');
            localStorage.removeItem('joinParams');
        }
    }, []);

    const set = (params: GameJoinParams) => {
        setParams(params);
        if (!params)
            localStorage.removeItem('joinParams');
        else
            localStorage.setItem('joinParams', JSON.stringify(params));
    };

    return [params, set] as [typeof params, typeof setParams];
}