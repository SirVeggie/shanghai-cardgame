import { GameEvent, GAME_EVENT, WebEvent } from 'shared';
import { useLocalSocket } from './useWebSocket';

export function useSessionComms(session: string, player: string, password: string, callback: (data: WebEvent) => void) {
    const initial: GameEvent = {
        type: GAME_EVENT,
        action: 'connect',
        join: {
            lobbyName: session,
            password,
            playerName: player
        },
        sessionId: '',
        playerId: ''
    };
    
    const [sendData, connected] = useLocalSocket(initial, data => {
        callback(data);
    });
    
    const send = (data: GameEvent) => {
        sendData(data);
    };
    
    return [send, connected] as [typeof send, typeof connected];
}