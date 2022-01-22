import { GamePlayer, Meld, Player, RoundConfig, ShanghaiGame, ShanghaiOptions, ShanghaiState } from 'shared'

export const getDefaultConfiguration = (initialPlayer: string): ShanghaiOptions => ({
    players: [{
        id: 0,
        name: initialPlayer,
        isReady: false
    }],
    shanghaiCount: 3,
    rounds: defaultRounds
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
        shanghaiFor: null,
        deck: [],
        discarded: [],
    }
}

const createPlayer = (name: Player): GamePlayer => ({
    points: 0,
    cards: [],
    melded: [],
    shanghaiCount: 0,
    canTakeCard: false
})

const defaultRound = (description: string, cardCount: number, rounds: number[]): RoundConfig => {
    const melds: Meld[] = rounds.map(r => {
        return r > 0 ? {
            type: "set",
            length: r
        } : {
            type: "straight",
            length: -r
        }
    })

    return {
        description,
        cardCount,
        deckCount: 2,
        jokerCount: 4,
        melds
    }
}

const defaultRounds: RoundConfig[] = [
    defaultRound("Two sets", 11, [3, 3]),
    defaultRound("Set and straight", 11, [3, -4]),
    defaultRound("Two straights", 11, [-4, -4]),
    defaultRound("Three sets", 11, [3, 3, 3]),
    defaultRound("Two sets and a straight", 11, [3, 3, -4]),
    defaultRound("One set and two straights", 11, [3, -4, -4]),
    defaultRound("Three straights", 13, [-4, -4, -4]),
]
