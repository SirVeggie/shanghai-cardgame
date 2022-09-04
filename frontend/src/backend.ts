import axios from 'axios';
import { GameJoinParams, SessionPublic } from 'shared';

function handleError(reason: any): any {
    if (reason.response?.status?.toString().startsWith('4'))
        if (reason.response.data)
            throw { ...reason.response.data, status: reason.response.status };
    throw reason;
}

export function createSession(params: GameJoinParams): Promise<SessionPublic> {
    return axios.post('/api/create', params)
        .then(res => res.data)
        .catch(handleError);
}

export function joinSession(params: GameJoinParams): Promise<SessionPublic> {
    return axios.post('/api/join', params)
        .then(res => res.data)
        .catch(handleError);
}