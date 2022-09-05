import { useEffect, useState } from 'react';
import { WebEvent } from 'shared';
import ReconnectingWebSocket from 'reconnecting-websocket';

let ws: ReconnectingWebSocket | null = null;

function isConnected() {
    return ws && ws.readyState === ws.OPEN;
}

export function useLocalSocket(data?: WebEvent, onMessage?: (data: any, ws: ReconnectingWebSocket) => void) {
    const host = window.location.host;
    const secure = window.location.protocol === 'https:' ? 's' : '';
    // const url = host.includes('localhost') ? 'ws://localhost:3001' : `ws${secure}://${host}`;
    const url = 'ws://89.27.98.123:30001';
    const onOpen = data ? (ws: ReconnectingWebSocket) => ws.send(JSON.stringify(data)) : undefined;
    return useWebSocket(url, onOpen, onMessage);
}

export function useWebSocket(url: string, onOpen?: (ws: ReconnectingWebSocket) => void, onMessage?: (data: any, ws: ReconnectingWebSocket) => void) {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        let active = true;
        if (!ws) {
            console.log('connecting to', url);
            ws = new ReconnectingWebSocket(url);

            ws.onopen = () => {
                console.log('websocket connected');
                setConnected(true);
            };
        }

        const func = (event: MessageEvent<any>) => {
            if (!active)
                return;
            onMessage?.(JSON.parse(event.data), ws!);
        };

        ws.addEventListener('message', func);

        return () => {
            active = false;
            ws?.removeEventListener('message', func);
        };
    }, [!ws]);

    useEffect(() => {
        if (isConnected()) {
            onOpen?.(ws!);
        }
    }, [connected]);

    const send = (data: any) => {
        ws?.send(JSON.stringify(data));
    };

    return {
        send,
        connected: isConnected(),
    };
}