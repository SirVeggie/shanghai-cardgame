import { Server } from 'http';
import { FatalError, fatalError, GameEvent, GAME_EVENT, UserError, uuid, WebEvent, wsError, wsMessage } from 'shared';
import { WebSocket, WebSocketServer } from 'ws';
import { addSession, sessions } from '../logic/controller';

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

        ws.onmessage = event => {
            try {
                handleMessage(event.data as string, ws);
            } catch (e) {
                if (e instanceof UserError)
                    return sendError(ws, e.message);
                if (e instanceof FatalError) {
                    sendError(ws, e.message);
                    return ws.close();
                }
                throw e;
            }
        };

        ws.onclose = () => handleDisconnect(ws);
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

    handleCreate(event, ws);
    handleJoin(event, ws);
    handleReConnect(event, ws);
    actions[event.type]?.forEach(x => x(event, ws));
}

function handleCreate(event: WebEvent, _ws: WebSocket): void {
    if (event.type !== GAME_EVENT || event.action !== 'create')
        return;
    if (!event.join)
        throw fatalError('Missing join params');
    addSession(event.join);
}

function handleJoin(event: WebEvent, ws: WebSocket): void {
    if (event.type !== GAME_EVENT || (event.action !== 'join' && event.action !== 'create'))
        return;
    if (!event.join)
        throw fatalError('Missing join params');

    const session = Object.values(sessions).find(x => x.name === event.join.lobbyName);
    if (!session)
        throw fatalError('Did not find lobby by that name');
    if (session.password !== event.join.password)
        throw fatalError('Wrong password');
    if (session.state !== 'waiting-players')
        throw fatalError('Cannot join an ongoing game');
    if (session.players.some(x => x.name === event.join!.playerName))
        throw fatalError('A player by that name is already in the lobby');

    event.playerId = uuid();

    if (!clients[session.id])
        clients[session.id] = [];
    clients[session.id].push({ playerId: event.playerId, ws });
}

function handleReConnect(event: WebEvent, ws: WebSocket): void {
    if (event.type !== GAME_EVENT || event.action !== 'connect')
        return;
    if (!event.join)
        throw fatalError('Missing join params');

    const session = Object.values(sessions).find(x => x.name === event.join.lobbyName);
    if (!session)
        throw fatalError('Did not find lobby by that name');
    if (session.password !== event.join.password)
        throw fatalError('Wrong password');
    const existing = session.players.find(x => x.name === event.join.playerName);
    if (!existing)
        throw fatalError('A player by that name does not exist in the lobby');
    if (clients[session.id]?.some(x => x.playerId === existing.id))
        throw fatalError('That player is already connected');
    
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

    if (event)
        actions[event.type]?.forEach(x => x(event!, ws));
    removeWsConnection(ws);
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