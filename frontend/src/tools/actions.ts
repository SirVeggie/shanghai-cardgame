import { Card, GameEvent, GAME_EVENT, Meld, MeldAdd } from 'shared';

export function setReady(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'set-ready',
        playerId,
        sessionId,
    };
}

export function revealCard(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'reveal',
        playerId,
        sessionId,
    };
}

export function callShanghai(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'call-shanghai',
        playerId,
        sessionId,
    };
}

export function allowShanghai(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'allow-shanghai',
        playerId,
        sessionId,
    };
}

export function drawDeck(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'draw-deck',
        playerId,
        sessionId,
    };
}

export function drawDiscard(sessionId: string, playerId: string): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'draw-discard',
        playerId,
        sessionId,
    };
}

export function meldCards(sessionId: string, playerId: string, melds: Meld[]): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'meld',
        playerId,
        sessionId,
        melds
    };
}

export function addToMeld(sessionId: string, playerId: string, add: MeldAdd): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'add-to-meld',
        playerId,
        sessionId,
        meldAdd: add,
    };
}

export function discardCard(sessionId: string, playerId: string, card: Card): GameEvent {
    return {
        type: GAME_EVENT,
        action: 'discard',
        playerId,
        sessionId,
        cards: [card],
    };
}