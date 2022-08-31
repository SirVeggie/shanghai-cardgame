import { Server } from 'http';
import { GameEvent, GAME_EVENT, WebEvent, wsError, wsMessage } from 'shared';
import { WebSocket, WebSocketServer } from 'ws';
import { sessions } from '../logic/controller';

type Actor = { playerId: string, ws: WebSocket; };
let wss: WebSocketServer = null as any;
const actions: Record<WebEvent['type'], ((data: WebEvent, ws: WebSocket) => void)[]> = {} as any;
const clients: Record<string, Actor[]> = {};

export function createSocket(port: number): void;
export function createSocket(server: Server): void;
export function createSocket(a: number | Server) {
    const options = typeof a === 'number' ? { port: a } : { server: a };
    wss = new WebSocketServer(options);
    createSocketBase();
}

function createSocketBase() {
    wss.on('connection', ws => {
        console.log('client connected');

        ws.onmessage = event => handleMessage(event.data as string, ws);
        ws.onclose = () => {
            console.log('client disconnected');
            removeWsConnection(ws);
        };
    });
}

export function removeWsConnection(ws: WebSocket) {
    Object.keys(clients).forEach(x => {
        const index = clients[x].findIndex(y => y.ws === ws);
        if (index !== -1)
            clients[x].splice(index, 1);
        if (clients[x].length === 0)
            delete clients[x];
    });

    ws.close();
}

function handleMessage(message: string, ws: WebSocket) {
    const event = JSON.parse(message) as WebEvent;
    console.log(`Incoming event: ${event.type} ${(event as any).action ? `action: ${(event as any).action}` : ''}`);

    handleJoin(event, ws);
    // handleLeave(event, ws);
    actions[event.type]?.forEach(x => x(event, ws));
}

function handleJoin(event: WebEvent, ws: WebSocket): void {
    if (event.type !== GAME_EVENT || event.action !== 'join')
        return;
    if (!event.join)
        return;
    const session = Object.values(sessions).find(x => x.name === event.join!.lobbyName);
    if (!session)
        return;

    if (session.password !== event.join.password) {
        sendError(ws, 'Wrong password');
        return ws.close();
    }

    if (session.state !== 'waiting-players') {
        sendError(ws, 'Cannot join an ongoing game');
        return ws.close();
    }

    if (session.players.some(x => x.name === event.join!.playerName)) {
        sendError(ws, 'A player by that name is already in the lobby');
        return ws.close();
    }

    if (!clients[event.sessionId])
        clients[event.sessionId] = [];
    clients[event.sessionId].push({ playerId: event.playerId, ws });
}

// function handleLeave(event: WebEvent, ws: WebSocket) {
//     if (event.type !== SESSION_EVENT || event.action !== 'leave')
//         return;
//     removeWsConnection(ws);
// }

export function subscribeEvent<T extends WebEvent>(event: T['type'], func: (event: T, ws: WebSocket) => void): void {
    if (!actions[event])
        actions[event] = [];
    actions[event].push(func as any);
}

export function sendEvent(event: GameEvent, includeSelf?: boolean) {
    clients[event.sessionId]?.forEach(x => {
        if (x.playerId !== event.playerId || includeSelf) {
            x.ws.send(JSON.stringify(event));
        }
    });
}

export function sendMessage(message: string, event: GameEvent, includeSelf?: boolean) {
    clients[event.sessionId]?.forEach(x => {
        if (x.playerId !== event.playerId || includeSelf) {
            sendMessageWS(x.ws, message);
        }
    });
}

export function sendMessageWS(ws: WebSocket, message: string) {
    ws.send(JSON.stringify(wsMessage(message)));
}

export function sendError(ws: WebSocket, error: string) {
    ws.send(JSON.stringify(wsError(error)));
}

export function sendAll(session: string, action: (player: Actor) => WebEvent) {
    if (!clients[session])
        return console.log(`Session ${session} is empty at sendAll`);
    console.log(`Sending all players in session ${session} ${clients[session]}`);
    // Runs conversions first before sending events to avoid sending partially if errors occur
    const messages = clients[session].map(x => ({ actor: x, action: action(x) }));
    messages.forEach(x => x.actor.ws.send(JSON.stringify(x.action)));
}