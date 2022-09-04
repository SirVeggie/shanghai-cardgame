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
    if (session.state !== 'waiting-players')
        throw userError('Cannot join an ongoing game');
    if (session.players.some(x => x.name === params.playerName))
        throw userError('A player by that name is already in the lobby');

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
        tempCards: []
    };

    session.players.push(player);
    syncList();
    
    return convertSessionToPublic(session);
}