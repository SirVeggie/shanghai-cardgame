import { Card, CardRank, Coord, ErrorEvent, ERROR_EVENT, GameConfig, InfoEvent, INFO_EVENT, JOKER_RANK, Meld, MeldConfig, MessageEvent, MESSAGE_EVENT, Player, PlayerPublic, RoundConfig, Session, SessionPublic } from './types';
import { v4 } from 'uuid';
import { isJoker } from './validation';
import arrayShuffle from 'shuffle-array';
import { ctool } from './cardTool';
import { countBy, floor } from 'lodash';
import _ from 'lodash';

export * from './types';
export * from './validation';
export * from './cardTool';

export function uuid(): string {
    return v4();
}

export function sleep(ms: number): Promise<unknown> {
    return new Promise(res => setTimeout(res, ms));
}

export class UserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export function userError(message: string): UserError {
    return new UserError(message);
}

export function wsError(message: string): ErrorEvent {
    return {
        type: ERROR_EVENT,
        message
    };
}

export function wsMessage(message: string, method: MessageEvent['method']): MessageEvent {
    return {
        type: MESSAGE_EVENT,
        method,
        message,
    };
}

export function wsInfo(event: InfoEvent['event']): InfoEvent {
    return {
        type: INFO_EVENT,
        event
    };
}

export function assertNever(x: never): never {
    throw new Error('Unexpected object: ' + JSON.stringify(x));
}

export function convertSessionToPublic(session: Session, playerId?: string): SessionPublic {
    const len = session.discard.length;
    return {
        id: session.id,
        name: session.name,
        config: session.config,
        state: session.state,
        round: session.round,
        turn: session.turn,
        winnerId: session.winnerId,
        currentPlayerId: session.currentPlayerId,
        deckCardAmount: session.deck.length,
        turnStartTime: session.turnStartTime,
        gameStartTime: session.gameStartTime,
        discardOwner: session.discardOwner,
        pendingShanghai: session.pendingShanghai,

        players: session.players.map(x => convertPlayerToPublic(x)),
        me: session.players.find(x => x.id === playerId),
        discard: {
            top: session.discard[len - 1],
            bottom: session.discard[len - 2]
        }
    };
}

export function convertPlayerToPublic(player: Player): PlayerPublic {
    return {
        id: player.id,
        name: player.name,
        isReady: player.isReady,
        cardAmount: player.cards.length,
        points: player.points,
        melds: player.melds,
        remainingShouts: player.remainingShouts,
        tempCards: player.tempCards,
        playtime: player.playtime,
    };
}

export function getNextPlayer(playerId: string, players: Player[] | PlayerPublic[]): Player | PlayerPublic {
    const index = players.findIndex(x => x.id === playerId);
    if (index === -1)
        throw Error('Invalid player id');
    const next = index + 1 === players.length ? 0 : index + 1;
    return players[next];
}

export function getPrevPlayer(playerId: string, players: Player[] | PlayerPublic[]): Player | PlayerPublic {
    const index = players.findIndex(x => x.id === playerId);
    if (index === -1)
        throw Error('Invalid player id');
    const prev = index === 0 ? players.length - 1 : index - 1;
    return players[prev];
}

export function createPlayer(id: string, name: string): PlayerPublic {
    return {
        id,
        name,
        isReady: false,
        cardAmount: 0,
        melds: [],
        points: 0,
        remainingShouts: 0,
        tempCards: [],
        playtime: 0,
    };
}

function createRound(
    description: string,
    cardCount: number,
    meldRequirements: number[] | MeldConfig[],
    deckCount = 2,
    jokerCount = 4,
    shanghaiCount = 3,
    shanghaiPenaltyCount = 1
): RoundConfig {
    const melds: MeldConfig[] = typeof meldRequirements[0] === 'number' ? meldRequirements.map(r => {
        return r > 0 ? {
            type: 'set',
            length: r
        } as MeldConfig : {
            type: 'straight',
            length: -r
        } as MeldConfig;
    }) : meldRequirements as MeldConfig[];

    return {
        description,
        cardCount,
        deckCount,
        jokerCount,
        shanghaiCount,
        shanghaiPenaltyCount,
        melds
    };
}

const defaultRounds: RoundConfig[] = [
    createRound('Two sets', 11, [3, 3]),
    createRound('Set and straight', 11, [3, -4]),
    createRound('Two straights', 11, [-4, -4]),
    createRound('Three sets', 11, [3, 3, 3]),
    createRound('Two sets and a straight', 11, [3, 3, -4]),
    createRound('One set and two straights', 11, [3, -4, -4]),
    createRound('Three straights', 13, [-4, -4, -4])
];

// const defaultHarder: RoundConfig[] = [
//     createRound('Three sets', 11, [3, 3, 3]),
//     createRound('Two sets and a straight', 11, [3, 3, -4]),
//     createRound('One set and two straights', 11, [3, -4, -4]),
//     createRound('Three straights', 13, [-4, -4, -4]),
//     createRound('Long straight and a set', 13, [-7, 5]),
//     createRound('Three sets and a straight', 15, [3, 3, 3, -5]),
//     createRound('Three long straights', 15, [-5, -5, -5]),
// ];

export const defaultConfig: GameConfig = {
    firstMeldBonusPoints: 15,
    jokerPenaltyAmountHand: 25,
    jokerPenaltyAmountMeld: 7,
    meldBonusStartPoints: 2,
    meldBonusIncrementPoints: 1,
    minimumCardPoints: 5,
    rounds: defaultRounds
};

export function checkOverlaps(melds: Meld[], hand: Card[]): boolean {
    const meldCards: Card[] = melds.reduce((acc, x) => acc.concat(x.cards), [] as Card[]);
    const meldCounts = _.countBy(meldCards, x => `${x.rank}|${x.suit}`);
    const handCounts = _.countBy(hand, x => `${x.rank}|${x.suit}`);
    
    for (const key in meldCounts) {
        if (meldCounts[key] > (handCounts[key] ?? 0)) {
            return true;
        }
    }
    
    return false;
}


export function shuffle(cards: Card[]) {
    // I don't trust it
    return arrayShuffle(arrayShuffle(arrayShuffle(cards)));
}

export function generateDeck(decks: number, jokers: number) {
    const cards: Card[] = [];
    
    for (let suit = 0; suit < 4; suit++) {
        for (let rank = 2; rank <= 14; rank++) {
            for (let deck = 0; deck < decks; deck++) {
                cards.push(ctool.fromValues(rank as CardRank, suit, deck));
            }
        }
    }
    
    for (let i = 0; i < jokers; i++) {
        cards.push(ctool.fromValues(JOKER_RANK, i % 4, floor(i / 4)));
    }
    
    return cards;
}

export function getPlayerRoundPoints (config: GameConfig, player: Player) {
    let points = player.cards.reduce((prev, curr) => {
        return prev + Math.max(config.minimumCardPoints, isJoker(curr) ? config.jokerPenaltyAmountHand : curr.rank);
    }, 0);

    player.melds.forEach(meld => meld.cards.forEach(c => {
        if (c.rank === JOKER_RANK) {
            points += config.jokerPenaltyAmountMeld;
        }
    }));

    return points;
}

export function cardOrderIndex(card: Card): number {
    return Number(isJoker(card)) * 100000 + card.suit * 1000 + card.rank * 10 + card.deck;
}

export function cardOrderIndexSet(card: Card): number {
    return Number(isJoker(card)) * 100000 + card.rank * 1000 + card.suit * 10 + card.deck;
}

export function sortCardsStraights(cards: Card[]) {
    return [...cards].sort((a, b) => cardOrderIndex(a) - cardOrderIndex(b));
}

export function sortCardsSets(cards: Card[]) {
    return [...cards].sort((a, b) => cardOrderIndexSet(a) - cardOrderIndexSet(b));
}

export function sortCardsHybrid(cards: Card[]) {
    const amounts = countBy(cards, x => x.rank);
    const sets = sortCardsSets(cards.filter(x => amounts[x.rank] > 1 && !isJoker(x)));
    const straights = sortCardsStraights(cards.filter(x => amounts[x.rank] === 1 || isJoker(x)));
    return sets.concat(straights);
}
    
export function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

export function lerpCoord(a: Coord, b: Coord, t: number): Coord {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t)
  };
}