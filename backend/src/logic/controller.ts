import { convertSessionToPublic, defaultConfig, GameEvent, GameJoinParams, GAME_EVENT, Session, SessionPublic, SYNC_EVENT, userError, uuid, validateJoinParams } from 'shared';
import { sendAll, subscribeEvent, syncList } from '../networking/socket';
import { eventHandler } from './eventHandler';

export const sessions: Record<string, Session> = {};

export function startController() {
    subscribeEvent<GameEvent>(GAME_EVENT, (event, ws) => eventHandler(sessions, event, ws));
}

export function updateClients(sessions: Record<string, Session>, source: GameEvent) {
    const session = sessions[source.sessionId];
    if (!session)
        return;
    sendAll(source.sessionId, x => {
        if (!session.players.some(y => y.id === x.playerId))
            throw Error('Could not find player in session');
        return ({
            type: SYNC_EVENT,
            session: convertSessionToPublic(session, x.playerId)
        });
    });
}

export function getSessions(): SessionPublic[] {
    return Object.values(sessions).map(x => convertSessionToPublic(x));
}

export function addSession(params: GameJoinParams) {
    if (Object.values(sessions).some(x => x.name === params.lobbyName))
        throw userError('Session already exists');
    validateJoinParams(params);

    const newSession: Session = {
        id: uuid(),
        name: params.lobbyName,
        config: params.config ? params.config : defaultConfig,
        password: params.password,
        turnStartTime: Date.now(),

        currentPlayerId: '',
        state: 'waiting-players',
        players: [],
        round: 0,
        turn: 0,
        deck: [],
        discard: []
    };

    sessions[newSession.id] = newSession;
}

export function removeSession(id: string) {
    if (!sessions[id])
        throw userError('Session not found');
    delete sessions[id];
    syncList();
}