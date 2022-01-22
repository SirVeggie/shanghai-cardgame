"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStagnatedGames = exports.updateGame = exports.addPlayerToGame = exports.createNewGame = exports.getGameById = exports.getGameByName = void 0;
const uuid_1 = require("uuid");
const shanghaiGameConfig_1 = require("./shanghaiGameConfig");
const games = new Map();
const hoursToMillis = (hours) => hours * 60 * 60 * 1000;
const maxGameTimeMs = hoursToMillis(14 * 24);
const maxInactiveTimeMs = hoursToMillis(7 * 27);
const getGameByName = (name) => {
    const game = getGames().find(g => g.name === name);
    if (game) {
        return (0, exports.getGameById)(game.id);
    }
};
exports.getGameByName = getGameByName;
const getGameById = (id) => {
    const game = games.get(id);
    if (!game) {
        return;
    }
    return JSON.parse(JSON.stringify(game));
};
exports.getGameById = getGameById;
const createNewGame = ({ lobbyName, playerName, password }) => {
    const date = new Date();
    const id = (0, uuid_1.v4)();
    if (getGames().some(game => game.name === lobbyName)) {
        return;
    }
    games.set(id, {
        id,
        name: lobbyName,
        startedAt: date,
        updatedAt: date,
        options: (0, shanghaiGameConfig_1.getDefaultConfiguration)(playerName)
    });
    return id;
};
exports.createNewGame = createNewGame;
const addPlayerToGame = (gameId, playerName) => {
    const game = (0, exports.getGameById)(gameId);
    if (!game) {
        return;
    }
    if (game.options.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
        return;
    }
    const newPlayer = {
        id: game.options.players.length,
        name: playerName,
        isReady: false
    };
    game.options.players.push(newPlayer);
    return game;
};
exports.addPlayerToGame = addPlayerToGame;
const updateGame = (gameId, newGame) => {
    const copy = JSON.parse(JSON.stringify(newGame));
    copy.updatedAt = new Date();
    games.set(gameId, copy);
};
exports.updateGame = updateGame;
const removeStagnatedGames = () => {
    getGames().filter(gameIsStagnated).forEach(g => games.delete(g.id));
};
exports.removeStagnatedGames = removeStagnatedGames;
const getGames = () => {
    const gameList = [];
    games.forEach((g) => gameList.push(g));
    return gameList;
};
const gameIsStagnated = (game) => {
    var _a;
    // Game has not started in 1 hour after lobby    
    if (!game.state && olderThan(game.updatedAt, hoursToMillis(1))) {
        return true;
    }
    // Game has ended    
    if (((_a = game.state) === null || _a === void 0 ? void 0 : _a.winnerId) && olderThan(game.updatedAt, hoursToMillis(1))) {
        return true;
    }
    // No action in 7 days    
    if (olderThan(game.updatedAt, hoursToMillis(7 * 24))) {
        return true;
    }
    // Older than 14 days    
    if (olderThan(game.startedAt, hoursToMillis(14 * 24))) {
        return true;
    }
    return false;
};
const olderThan = (date, timeMs) => date.getTime() > new Date().getTime() - timeMs;
