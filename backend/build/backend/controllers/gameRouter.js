"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shanghai_1 = require("../game/shanghai");
const gameManger_1 = require("../game/gameManger");
const router = (0, express_1.Router)();
const UPDATE_INTERVAL = 1000;
const SYNC_ACCURACY = 100;
router.get('/game', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.body["gameId"];
    const game = (0, gameManger_1.getGameById)(gameId);
    if (!game) {
        return res.status(404);
    }
    return res.json(game);
}));
router.get('/game/state', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.body["gameId"];
    const game = (0, gameManger_1.getGameById)(gameId);
    if (!(game === null || game === void 0 ? void 0 : game.state)) {
        return res.status(404);
    }
    const startTime = new Date().getTime();
    while (true) {
        const currentTime = new Date().getTime();
        if (currentTime - startTime >= UPDATE_INTERVAL) {
            break;
        }
        const mod = currentTime % UPDATE_INTERVAL;
        // sync state requests
        if (mod <= SYNC_ACCURACY) {
            break;
        }
        yield sleep(10);
    }
    return res.json(game.state);
}));
router.post('/game/new', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameParams = req.body["data"];
    const newId = (0, gameManger_1.createNewGame)(gameParams);
    if (!newId) {
        return res.status(400).send();
    }
    const game = (0, gameManger_1.getGameById)(newId);
    if (!game) {
        throw "Game did not exist after creation";
    }
    return res.json(game);
}));
router.post('/game/join', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const gameParams = req.body["data"];
    const game = (0, gameManger_1.getGameByName)(gameParams.lobbyName);
    if (!game) {
        return res.status(400).send();
    }
    if (((_a = game.password) === null || _a === void 0 ? void 0 : _a.length) && game.password !== gameParams.password) {
        return res.status(401).send();
    }
    const newGame = (0, gameManger_1.addPlayerToGame)(game.id, gameParams.playerName);
    if (!newGame) {
        return res.status(400).send();
    }
    return res.json(newGame);
}));
router.post('/game/action', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const action = req.body["data"];
    const game = (0, gameManger_1.getGameById)(action.gameId);
    if (!(game === null || game === void 0 ? void 0 : game.state)) {
        return res.status(400).send();
    }
    (0, shanghai_1.usingGameContext)(game.options, game.state, (handleAction, getState) => {
        const response = handleAction(action);
        if (response.success) {
            (0, gameManger_1.updateGame)(action.gameId, Object.assign(Object.assign({}, game), { state: getState() }));
        }
        res.json(response);
    });
}));
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.default = router;
