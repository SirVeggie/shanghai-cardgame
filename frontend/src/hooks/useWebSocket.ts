import { useEffect, useState } from 'react';
import { WebEvent } from 'shared';
import ReconnectingWebSocket from 'reconnecting-websocket';

export function useLocalSocket(data?: WebEvent, onMessage?: (data: any, ws: ReconnectingWebSocket) => void) {
    const host = window.location.host;
    const secure = window.location.protocol === 'https:' ? 's' : '';
    // const url = host.includes('localhost') ? 'ws://localhost:3001' : `ws${secure}://${host}`;
    const url = 'ws://89.27.98.123:30001';
    const onOpen = data ? (ws: ReconnectingWebSocket) => ws.send(JSON.stringify(data)) : undefined;
    return useWebSocket(url, onOpen, onMessage);
}

export function useWebSocket(url: string, onOpen?: (ws: ReconnectingWebSocket) => void, onMessage?: (data: any, ws: ReconnectingWebSocket) => void) {
    const [ws, setWS] = useState(null as unknown as ReconnectingWebSocket);
    const [connectedOnce, setConnected] = useState(false);

    useEffect(() => {
        const ws = new ReconnectingWebSocket(url);
        
        ws.onopen = () => {
            onOpen?.call(null, ws);
            setConnected(true);
        };

        ws.onmessage = event => {
            onMessage?.call(null, JSON.parse(event.data), ws);
        };

        setWS(ws);

        return () => {
            ws.onmessage = null;
            ws.onclose = null;
            ws.close();
        };
    }, []);

    const send = (data: any) => {
        if (ws) {
            ws.send(JSON.stringify(data));
        }
    };

    return {
        send,
        connected: connectedOnce && ws?.readyState === ws?.OPEN,
    };
}