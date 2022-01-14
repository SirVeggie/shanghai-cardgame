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
const shanghaiGameConfig_1 = require("../game/shanghaiGameConfig");
const router = (0, express_1.Router)();
const UPDATE_INTERVAL = 3000;
const SYNC_ACCURACY = 100;
router.get('/options', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.json((0, shanghai_1.getGame)());
}));
router.get('/state', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    return res.json((0, shanghai_1.getState)());
}));
router.get('/newgame', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, shanghai_1.startGame)({ options: (0, shanghaiGameConfig_1.getDefaultConfiguration)() });
    return res.status(200).send();
}));
router.post('/newgame', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const game = req.body["game"];
    if (game) {
        (0, shanghai_1.startGame)(game);
    }
    else {
        (0, shanghai_1.startGame)({ options: (0, shanghaiGameConfig_1.getDefaultConfiguration)() });
    }
    return res.status(200).send();
}));
router.post('/action', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const action = req.body["action"];
    return res.json((0, shanghai_1.handleAction)(action));
}));
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.default = router;
