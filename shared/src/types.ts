
export type NotificationClass = 'info' | 'success' | 'error';
export type NotificationType = {
    id: string;
    type: NotificationClass;
    message: string;
    hidden: boolean;
};

export type GameJoinParams = {
    lobbyName: string;
    playerName: string;
    password: string;
    config?: GameConfig;
};

export type GameState = 'waiting-players' | 'turn-start' | 'shanghai-called' | 'card-drawn' | 'round-end' | 'game-end';
export type Session = {
    id: string;
    name: string;
    config: GameConfig;
    password: string;

    state: GameState;
    players: Player[];
    currentPlayerId: string;
    round: number;
    turn: number;
    deck: Card[];
    discard: Card[];
    pendingShanghai?: string;
    winnerId?: string;
};

export type GameConfig = {
    minimumCardPoints: number;
    firstMeldBonusPoints: number;
    meldBonusStartPoints: number;
    meldBonusIncrementPoints: number;
    jokerPenaltyAmountMeld: number;
    jokerPenaltyAmountHand: number;
    rounds: RoundConfig[];
};

export type RoundConfig = {
    description: string;
    cardCount: number;
    deckCount: number;
    jokerCount: number;
    shanghaiCount: number;
    shanghaiPenaltyCount: number;
    melds: MeldConfig[];
};

export type SessionPublic = Omit<Session, 'players' | 'deck' | 'discard' | 'password'> & {
    me?: Player;
    players: PlayerPublic[];
    discard: {
        top: Card,
        bottom: Card;
    };
};

export type PlayerPublic = Omit<Player, 'cards' | 'newCards'>;
export type Player = {
    id: string;
    name: string;
    isReady: boolean;
    points: number;
    cards: Card[];
    melds: Meld[];
    remainingShouts: number;
    newCards: Card[];
    tempCards: Card[];
};

export type Card = {
    id: number;
    suit: CardSuit;
    rank: CardRank;
    deck: number;
};

export type CardRank = NormalRank | JokerRank;
export type NormalRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
export const JOKER_RANK = 1;
export type JokerRank = typeof JOKER_RANK;
export type CardColor = 'red' | 'black';

export enum CardSuit {
    club,
    heart,
    spade,
    diamond
}

export enum CSuitIcon {
    '♣',
    '♥',
    '♠',
    '♦'
}

export const MELD_TYPES = ['set', 'straight', 'any-straight', 'skip-straight', 'house'] as const;
export type MeldType = typeof MELD_TYPES[number];
export type MeldConfig = {
    type: MeldType;
    length: number;
};

export type Meld = {
    config: MeldConfig;
    cards: Card[];
};

export type MeldAdd = {
    card: Card;
    targetPlayerId: string;
    meldIndex: number;
    position: 'start' | 'end' | 'joker'
};

export type WebEvent = GameEvent | SyncEvent | ErrorEvent | MessageEvent;

export const GAME_EVENT = 'game';
export type GameEvent = {
    type: typeof GAME_EVENT;
    playerId: string;
    sessionId: string;
} & ({
    action: SessionAction | GameAction;
} | {
    action: 'discard';
    cards: Card[];
} | {
    action: 'join' | 'create' | 'connect';
    join: GameJoinParams;
} | {
    action: 'meld';
    melds: Meld[];
} | {
    action: 'add-to-meld';
    meldAdd: MeldAdd;
});

export const SYNC_EVENT = 'sync';
export type SyncEvent = {
    type: typeof SYNC_EVENT;
    session: SessionPublic;
};

export const ERROR_EVENT = 'error';
export type ErrorEvent = {
    type: typeof ERROR_EVENT;
    message: string;
};

export const MESSAGE_EVENT = 'message';
export type MessageEvent = {
    type: typeof MESSAGE_EVENT;
    message: string;
};

export type SessionAction = typeof SESSION_ACTIONS[number];
export const SESSION_ACTIONS = [
    // 'create',
    'delete',
    // 'join',
    // 'connect',
    'disconnect'
] as const;

export type GameAction = typeof GAME_ACTIONS[number];
export const GAME_ACTIONS = [
    'draw-deck',
    'draw-discard',
    // 'discard',
    'call-shanghai',
    'set-ready',
    'reveal',
    // 'meld',
    // 'add-to-meld'
] as const;

export type DataAction = typeof DATA_ACTIONS[number];
export const DATA_ACTIONS = [
    'create',
    'join',
    'connect',
    'discard',
    'meld',
    'add-to-meld'
] as const;