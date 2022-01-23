import { v4 as uuidv4 } from 'uuid'
import { GameJoinParams, Player, ShanghaiGame } from 'shared'
import { getDefaultConfiguration } from './shanghaiGameConfig'

const games = new Map<string, ShanghaiGame>()

const hoursToMillis = (hours: number) => hours * 60 * 60 * 1000

const maxGameTimeMs = hoursToMillis(14 * 24)
const maxInactiveTimeMs = hoursToMillis(7 * 27)

export const getGameByName = (name: string): ShanghaiGame | undefined => {
    const game = getGames().find(g => g.name === name)
    if (game) {
        return getGameById(game.id)
    }
}

export const getGameById = (id: string): ShanghaiGame | undefined => {
    const game = games.get(id)

    if (!game) {
        return
    }

    return JSON.parse(JSON.stringify(game))
}

export const createNewGame = ({ lobbyName, playerName, password }: GameJoinParams): string | undefined => {
    const date = new Date()
    const id = uuidv4()

    if (getGames().some(game => game.name === lobbyName)) {
        return
    }

    games.set(id, {
        id,
        name: lobbyName,
        password,
        startedAt: date,
        updatedAt: date,
        options: getDefaultConfiguration(playerName)
    })

    return id
}

export const addPlayerToGame = (gameId: string, playerName: string): ShanghaiGame | undefined => {
    const game = getGameById(gameId)
    if (!game) {
        return
    }

    if (game.options.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
        return
    }

    const newPlayer: Player = {
        id: game.options.players.length,
        name: playerName,
        isReady: false
    }

    game.options.players.push(newPlayer)
    return game
}

export const updateGame = (gameId: string, newGame: ShanghaiGame) => {
    const copy: ShanghaiGame = JSON.parse(JSON.stringify(newGame))
    copy.updatedAt = new Date()
    games.set(gameId, copy)
}

export const removeStagnatedGames = () => {
    getGames().filter(gameIsStagnated).forEach(g => games.delete(g.id))
}

const getGames = () => {
    const gameList: ShanghaiGame[] = []
    games.forEach((g) => gameList.push(g))
    return gameList
}

const gameIsStagnated = (game: ShanghaiGame): boolean => {
    // Game has not started in 1 hour after lobby    
    if (!game.state && olderThan(game.updatedAt, hoursToMillis(1))) {
        return true
    }

    // Game has ended    
    if (game.state?.winnerId && olderThan(game.updatedAt, hoursToMillis(1))) {
        return true
    }

    // No action in 7 days    
    if (olderThan(game.updatedAt, hoursToMillis(7 * 24))) {
        return true
    }

    // Older than 14 days    
    if (olderThan(game.startedAt, hoursToMillis(14 * 24))) {
        return true
    }

    return false
}

const olderThan = (date: Date, timeMs: number) => date.getTime() > new Date().getTime() - timeMs
