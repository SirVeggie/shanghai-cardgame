import { GamePlayer, Meld, MeldType, Player, RoundConfig, ShanghaiGame, ShanghaiOptions, ShanghaiState } from 'shared'

export const getDefaultConfiguration = (initialPlayer: string): ShanghaiOptions => ({
    players: [{
        id: 0,
        name: initialPlayer,
        isReady: false
    }],
    rounds: defaultHarder,
    minimumCardPoints: 5,
    firstMeldBonusPoints: 15,
    meldBonusStartPoints: 2,
    meldBonusIncrementPoints: 1,
    jokerPenaltyAmount: 7
})

export const startGame = (game: ShanghaiGame): ShanghaiGame => {
    return {
        ...game,
        state: initialState(game.options.players)
    }
}


const initialState = (players: Player[]): ShanghaiState => {
    return {
        players: players.map(createPlayer),
        roundIsOn: false,
        roundNumber: -1,
        turn: 0,
        shanghaiIsAllowed: false,
        shanghaiForId: undefined,
        deck: [],
        discarded: [],
    }
}

const createPlayer = (owner: Player): GamePlayer => ({
    id: owner.id,
    points: 0,
    cards: [],
    melded: [],
    shanghaiCount: 0,
    canTakeCard: false
})

const defaultRound = (description: string, cardCount: number, rounds: number[], deckCount = 2, jokerCount = 4, shanghaiCount = 3, shanghaiPenaltyCount = 1, nonColor = false): RoundConfig => {
    const melds: Meld[] = rounds.map(r => {
        return r > 0 ? {
            type: "set",
            length: r
        } : {
            type: nonColor ? 'loosestraight' : "straight",
            length: -r
        }
    })

    return {
        description,
        cardCount,
        deckCount,
        jokerCount,
        shanghaiCount,
        shanghaiPenaltyCount,
        melds
    }
}

const customRounds: RoundConfig[] = [
    defaultRound("Welcome to SuperShanghai!", 9, [1, 1, 1], 2, 0, 1),
    defaultRound("Three sets", 11, [3, 3, 3]),
    defaultRound("Now were getting started!", 2, [2, 3, -4], 2, 8, 10),
    defaultRound("One set and two straights", 11, [3, -4, -4]),
    defaultRound("Superstraight!", 13, [-13], 2, 4, 3, 1, true),
    defaultRound("Three straights", 13, [-4, -4, -4]),
    defaultRound("Superset!", 13, [8, 4], 3, 24, 3, 1, true),
]

const defaultRounds: RoundConfig[] = [
    defaultRound("Two sets", 11, [3, 3]),
    defaultRound("Set and straight", 11, [3, -4]),
    defaultRound("Two straights", 11, [-4, -4]),
    defaultRound("Three sets", 11, [3, 3, 3]),
    defaultRound("Two sets and a straight", 11, [3, 3, -4]),
    defaultRound("One set and two straights", 11, [3, -4, -4]),
    defaultRound("Three straights", 13, [-4, -4, -4]),
]

const defaultHarder: RoundConfig[] = [
    defaultRound("Three sets", 11, [3, 3, 3]),
    defaultRound("Two sets and a straight", 11, [3, 3, -4]),
    defaultRound("One set and two straights", 11, [3, -4, -4]),
    defaultRound("Three straights", 13, [-4, -4, -4]),
    defaultRound("Long straight and a set", 13, [-7, -6]),
    defaultRound("Three sets and a straight", 15, [3, 3, 3, -5]),
    defaultRound("Three long straights", 15, [-5, -5, -5]),
]