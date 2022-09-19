import { Server } from 'http';
import { convertSessionToPublic, GameEvent, GAME_EVENT, InfoEvent, MessageEvent, SessionListEvent, SESSION_LIST_EVENT, userError, UserError, validateJoinParams, WebEvent, wsError, wsInfo, wsMessage } from 'shared';
import { WebSocket, WebSocketServer } from 'ws';
import { cleanupSessions, sessions } from '../logic/controller';

type Actor = { playerId: string, ws: WebSocket; };
let wss: WebSocketServer = null as any;
const actions: Record<WebEvent['type'], ((data: WebEvent, ws: WebSocket) => void)[]> = {} as any;
export const clients: Record<string, Actor[]> = {};
const listListeners: WebSocket[] = [];


export function createSocket(port: number): void;
export function createSocket(server: Server): void;
export function createSocket(a: number | Server) {
    const options = typeof a === 'number' ? { port: a } : { server: a };
    wss = new WebSocketServer(options);
    createSocketBase();
}

function createSocketBase() {
    wss.on('connection', (ws, req) => {
        console.log(`client connected from ${req.socket.remoteAddress}`);
        cleanupSessions();
        
        ws.onmessage = event => {
            try {
                handleMessage(event.data as string, ws);
            } catch (e) {
                if (e instanceof UserError) {
                    console.error(e.message);
                    return sendError(ws, e.message);
                }

                throw e;
            }
        };

        ws.onclose = () => {
            handleDisconnect(ws);
        };
    });
}

function handleMessage(message: string, ws: WebSocket) {
    const event = JSON.parse(message) as WebEvent;
    console.log(`Incoming event: ${event.type}${(event as any).action ? `, action: ${(event as any).action}` : ''}`);

    if (event.type === SESSION_LIST_EVENT)
        return handleList(event, ws);
    handleConnect(event, ws);
    if (event.type === GAME_EVENT && event.action === 'disconnect')
        return handleDisconnect(ws);
    actions[event.type]?.forEach(x => x(event, ws));
}

export function removeWsConnection(ws: WebSocket) {
    const index = listListeners.indexOf(ws);
    if (index !== -1)
        listListeners.splice(index, 1);
    Object.keys(clients).forEach(x => {
        const index = clients[x].findIndex(y => y.ws === ws);
        if (index !== -1)
            clients[x].splice(index, 1);
        if (clients[x].length === 0)
            delete clients[x];
    });
}

function handleList(event: SessionListEvent, ws: WebSocket) {
    const index = listListeners.indexOf(ws);
    if (event.action === 'subscribe') {
        if (index === -1)
            listListeners.push(ws);
        syncList();
    } else if (event.action === 'unsubscribe') {
        if (index !== -1)
            listListeners.splice(index, 1);
    }
}

export function syncList() {
    const list = Object.values(sessions).map(x => convertSessionToPublic(x));
    const event: SessionListEvent = {
        type: SESSION_LIST_EVENT,
        action: 'update',
        sessions: list
    };

    for (const listener of listListeners) {
        listener.send(JSON.stringify(event));
    }
}

function handleConnect(event: WebEvent, ws: WebSocket): void {
    if (event.type !== GAME_EVENT || event.action !== 'connect')
        return;
    validateJoinParams(event.join);

    const session = Object.values(sessions).find(x => x.name === event.join.lobbyName);
    if (!session)
        throw userError('Did not find lobby by that name');
    if (session.password !== event.join.password)
        throw userError('Wrong password');
    const existing = session.players.find(x => x.name === event.join.playerName);
    if (!existing)
        throw userError('A player by that name does not exist in the lobby');
    if (clients[session.id]?.some(x => x.playerId === existing.id))
        throw userError('A player by that name is already connected');

    event.playerId = existing.id;
    event.sessionId = session.id;

    if (!clients[session.id])
        clients[session.id] = [];
    clients[session.id].push({ playerId: existing.id, ws });
}

function handleDisconnect(ws: WebSocket) {
    console.log('client disconnected');

    let event: GameEvent | undefined = undefined;
    for (const [key, value] of Object.entries(clients)) {
        const actor = value.find(x => x.ws === ws);
        if (actor) {
            event = {
                type: GAME_EVENT,
                action: 'disconnect',
                playerId: actor.playerId,
                sessionId: key
            };
        }
    }

    removeWsConnection(ws);
    if (event)
        actions[event.type]?.forEach(x => x(event!, ws));
}

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

export function sendMessage(message: string, event: GameEvent, method: MessageEvent['method'] = 'log') {
    clients[event.sessionId]?.forEach(x => {
        sendMessageWS(x.ws, message, method);
    });
}

export function sendMessageSingle(message: string, playerId: string, method: MessageEvent['method']) {
    for (const session of Object.values(clients)) {
        const actor = session.find(x => x.playerId === playerId);
        if (actor) {
            return sendMessageWS(actor.ws, message, method);
        }
    }
}

export function sendInfo(event: InfoEvent['event'], playerId: string) {
    for (const session of Object.values(clients)) {
        const actor = session.find(x => x.playerId === playerId);
        if (actor) {
            return actor.ws.send(JSON.stringify(wsInfo(event)));
        }
    }
}

export function sendInfoAll(event: InfoEvent['event'], sessionId: string) {
    clients[sessionId]?.forEach(x => {
        x.ws.send(JSON.stringify(wsInfo(event)));
    });
}

export function sendMessageWS(ws: WebSocket, message: string, method: MessageEvent['method']) {
    ws.send(JSON.stringify(wsMessage(message, method)));
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