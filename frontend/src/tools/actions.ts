import { Card, GameEvent, GAME_EVENT, Meld, MeldAdd } from 'shared';
import { deviceIdComms } from '../hooks/useSessionComms';

export function setReady(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'set-ready',
        deviceId: deviceIdComms,
        playerId,
        sessionId,
    };
}

export function revealCard(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'reveal',
        deviceId: deviceIdComms,
        playerId,
        sessionId,
    };
}

export function callShanghai(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'call-shanghai',
        deviceId: deviceIdComms,
        playerId,
        sessionId,
    };
}

export function allowShanghai(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'allow-shanghai',
        deviceId: deviceIdComms,
        playerId,
        sessionId,
    };
}

export function drawDeck(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'draw-deck',
        deviceId: deviceIdComms,
        playerId,
        sessionId,
    };
}

export function drawDiscard(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'draw-discard',
        deviceId: deviceIdComms,
        playerId,
        sessionId,
    };
}

export function meldCards(sessionId: string, playerId: string, melds: Meld[]): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'meld',
        deviceId: deviceIdComms,
        playerId,
        sessionId,
        melds
    };
}

export function addToMeld(sessionId: string, playerId: string, add: MeldAdd): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'add-to-meld',
        deviceId: deviceIdComms,
        playerId,
        sessionId,
        meldAdd: add,
    };
}

export function discardCard(sessionId: string, playerId: string, card: Card): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'discard',
        deviceId: deviceIdComms,
        playerId,
        sessionId,
        cards: [card],
    };
}