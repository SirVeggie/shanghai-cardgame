import { useEffect, useState } from 'react';
import { GameEvent, GameJoinParams, GAME_EVENT, WebEvent } from 'shared';
import { useLocalSocket } from './useWebSocket';

export function useSessionComms(params: GameJoinParams | null, callback: (data: WebEvent) => void) {
    const [retry, setRetry] = useState(false);
    if (!params && !retry)
        setRetry(true);
    
    const connectEvent: GameEvent | undefined = !params ? undefined : {
        type: GAME_EVENT,
        action: 'connect',
        join: {
            lobbyName: params.lobbyName,
            playerName: params.playerName,
            password: params.password,
        },
        sessionId: '',
        playerId: ''
    };
    
    const ws = useLocalSocket(connectEvent, callback);
    
    useEffect(() => {
        if (!params || !ws.connected || !retry)
            return;
        ws.send(connectEvent);
    }, [params?.lobbyName, ws.connected]);
    
    const send = (data: GameEvent) => ws.send(data);
    
    return { ...ws, send };
}