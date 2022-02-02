import { GamePlayer, Meld, MeldType, Player, RoundConfig, ShanghaiGame, ShanghaiOptions, ShanghaiState } from 'shared'

export const getDefaultConfiguration = (initialPlayer: string): ShanghaiOptions => ({
    players: [{
        id: 0,
        name: initialPlayer,
        isReady: false
    }],
    rounds: customRounds
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

const defaultRound = (description: string, cardCount: number, rounds: number[], deckCount = 2, jokerCount = 4, shanghaiCount = 3, nonColor = false): RoundConfig => {
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
        melds
    }
}

const customRounds: RoundConfig[] = [
    defaultRound("Test", 11, [-4], 2, 4, 3, true),
    defaultRound("Set and straight", 11, [3, -4]),
    defaultRound("Two straights", 11, [-4, -4]),
    defaultRound("Three sets", 11, [3, 3, 3]),
    defaultRound("Two sets and a straight", 11, [3, 3, -4]),
    defaultRound("One set and two straights", 11, [3, -4, -4]),
    defaultRound("Three straights", 13, [-4, -4, -4]),
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
