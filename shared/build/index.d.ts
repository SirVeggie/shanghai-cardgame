export declare const ctool: {
    fromId: (id: number) => Card;
    fromValues: (rank: CRank, suit: CSuit, deck: number) => Card;
    color: (card: Card) => CColor;
    name: (card: Card) => string;
    longName: (card: Card) => string;
    suitName: (card: Card) => string;
    suitIcon: (card: Card) => string;
    rankName: (card: Card) => string;
    rankPrefix: (card: Card) => string;
    nextRank: (rank: CNormalRank, loop?: boolean) => CNormalRank | undefined;
};
export declare type GameJoinParams = {
    lobbyName: string;
    playerName: string;
    password?: string;
};
export declare type GameParams = {
    gameId: string;
};
export declare type GamePlayerParams = {
    gameId: string;
    playerId: number;
};
export declare type Shanghai = {
    options: ShanghaiOptions;
    state: ShanghaiState;
};
export interface ShanghaiGame {
    id: string;
    name: string;
    startedAt: Date;
    updatedAt: Date;
    options: ShanghaiOptions;
    password?: string;
    state?: ShanghaiState;
}
export declare type ActionResponse = {
    success: boolean;
    error?: string;
    message?: string;
};
export declare type ShanghaiOptions = {
    players: Player[];
    shanghaiCount: number;
    rounds: RoundConfig[];
};
export declare type ShanghaiState = {
    players: GamePlayer[];
    roundNumber: number;
    turn: number;
    shanghaiIsAllowed: boolean;
    shanghaiForId?: number;
    deck: Card[];
    discarded: Card[];
    discardTopOwnerId?: number;
    roundIsOn: boolean;
    winnerId?: number;
    message?: string;
};
export declare type Action = {
    playerId: number;
    gameId: string;
    revealDeck?: boolean;
    takeDiscard?: boolean;
    takeDeck?: boolean;
    meld?: MeldAction;
    addToMeld?: AddToMeldAction;
    discardID?: number;
    shanghai?: boolean;
    allowShanghai?: boolean;
};
export declare type Player = {
    id: number;
    name: string;
    isReady: boolean;
};
export declare type GamePlayer = {
    id: number;
    points: number;
    cards: Card[];
    melded: MeldedMeld[];
    shanghaiCount: number;
    canTakeCard: boolean;
    actionRelatedCardID?: number;
};
export declare type FullPlayer = Player & GamePlayer;
export declare type Card = {
    id: number;
    suit: CSuit;
    rank: CRank;
    deck: number;
    mustBeMelded?: boolean;
};
export declare enum CSuit {
    club = 0,
    heart = 1,
    spade = 2,
    diamond = 3
}
export declare enum CSuitIcon {
    '♣' = 0,
    '♥' = 1,
    '♠' = 2,
    '♦' = 3
}
export declare type CNormalRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
export declare type CRank = CNormalRank | 25;
export declare type CColor = 'red' | 'black';
export declare type RoundConfig = {
    description: string;
    cardCount: number;
    deckCount: number;
    jokerCount: number;
    melds: Meld[];
};
export declare type Meld = {
    type: MeldType;
    length: number;
};
export declare type MeldType = "set" | "straight";
export declare type MeldedMeld = {
    cards: Card[];
};
export declare type MeldAction = {
    melds: MeldCards[];
};
export declare type AddToMeldAction = {
    targetPlayerId: number;
    targetMeldIndex: number;
    cardToMeldId: number;
    replaceJoker?: boolean;
    insertBehind?: boolean;
};
export declare type MeldCards = {
    cardIDs: number[];
};
export declare const cardOrderIndex: (card: Card) => number;
export declare const getPlayerTurn: (state: ShanghaiState, turnIndex: number) => number;
export declare const getFullPlayer: (player: Player, state: ShanghaiState) => {
    id: number;
    points: number;
    cards: Card[];
    melded: MeldedMeld[];
    shanghaiCount: number;
    canTakeCard: boolean;
    actionRelatedCardID?: number | undefined;
    name: string;
    isReady: boolean;
};
