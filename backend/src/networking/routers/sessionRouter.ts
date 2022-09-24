import { Router } from 'express';
import { convertSessionToPublic, GameJoinParams, Player, userError, uuid, validateJoinParams } from 'shared';
import { addSession, sessions } from '../../logic/controller';
import { syncList } from '../socket';

export const sessionRouter = Router();

sessionRouter.post('/create', (req, res) => {
    const data = req.body as GameJoinParams;
    if (!data)
        throw userError('Missing join params');
    addSession(data);
    console.log(`Session created: ${data.lobbyName}`);
    const session = joinGame(data);
    res.send(session);
});

sessionRouter.post('/join', (req, res) => {
    const session = joinGame(req.body as GameJoinParams);
    res.send(session);
});

function joinGame(params: GameJoinParams) {
    validateJoinParams(params);

    const session = Object.values(sessions).find(x => x.name === params.lobbyName);
    if (!session)
        throw userError('Did not find lobby by that name');
    if (session.password !== params.password)
        throw userError('Wrong password');
    if (session.players.some(x => x.name === params.playerName))
        return reconnect(params);
    if (session.state !== 'waiting-players')
        throw userError('Cannot join an ongoing game');

    console.log(`Player joining: ${params.playerName}`);

    const player: Player = {
        id: uuid(),
        name: params.playerName,
        cards: [],
        isReady: false,
        melds: [],
        newCards: [],
        points: 0,
        remainingShouts: 0,
        tempCards: [],
        playtime: 0,
    };

    session.players.push(player);
    syncList();

    return convertSessionToPublic(session, player.id);
}

function reconnect(params: GameJoinParams) {
    const session = Object.values(sessions).find(x => x.name === params.lobbyName);
    if (!session)
        throw userError('Did not find lobby by that name');
    if (session.password !== params.password)
        throw userError('Wrong password');
    const player = session.players.find(x => x.name === params.playerName);
    if (!player)
        throw userError('Did not find player by that name');

    console.log(`Player reconnecting: ${params.playerName}`);
    return convertSessionToPublic(session, player.id);
}