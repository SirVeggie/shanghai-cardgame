"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGame = exports.getDefaultConfiguration = void 0;
const getDefaultConfiguration = (initialPlayer) => ({
    players: [{
            id: 0,
            name: initialPlayer,
            isReady: false
        }],
    shanghaiCount: 3,
    rounds: defaultRounds
});
exports.getDefaultConfiguration = getDefaultConfiguration;
const startGame = (game) => {
    return Object.assign(Object.assign({}, game), { state: initialState(game.options.players) });
};
exports.startGame = startGame;
const initialState = (players) => {
    return {
        players: players.map(createPlayer),
        roundIsOn: false,
        roundNumber: -1,
        turn: 0,
        shanghaiIsAllowed: false,
        shanghaiFor: null,
        deck: [],
        discarded: [],
    };
};
const createPlayer = (name) => ({
    points: 0,
    cards: [],
    melded: [],
    shanghaiCount: 0,
    canTakeCard: false
});
const defaultRound = (description, cardCount, rounds) => {
    const melds = rounds.map(r => {
        return r > 0 ? {
            type: "set",
            length: r
        } : {
            type: "straight",
            length: -r
        };
    });
    return {
        description,
        cardCount,
        deckCount: 2,
        jokerCount: 4,
        melds
    };
};
const defaultRounds = [
    defaultRound("Two sets", 11, [3, 3]),
    defaultRound("Set and straight", 11, [3, -4]),
    defaultRound("Two straights", 11, [-4, -4]),
    defaultRound("Three sets", 11, [3, 3, 3]),
    defaultRound("Two sets and a straight", 11, [3, 3, -4]),
    defaultRound("One set and two straights", 11, [3, -4, -4]),
    defaultRound("Three straights", 13, [-4, -4, -4]),
];
