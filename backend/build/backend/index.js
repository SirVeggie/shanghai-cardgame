"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import dotenv from 'dotenv'
const shanghai_1 = require("./game/shanghai");
const shanghaiGameConfig_1 = require("./game/shanghaiGameConfig");
//dotenv.config()
const test = () => {
    (0, shanghai_1.startGame)({ options: (0, shanghaiGameConfig_1.getDefaultConfiguration)() });
    console.log((0, shanghai_1.handleAction)({
        playerName: "Eetu",
        setReady: true
    }));
    console.log((0, shanghai_1.handleAction)({
        playerName: "Niko",
        setReady: true
    }));
    console.log((0, shanghai_1.handleAction)({
        playerName: "Veikka",
        setReady: true
    }));
    console.log((0, shanghai_1.handleAction)({
        playerName: "Johannes",
        setReady: true
    }));
};
test();
const server_1 = __importDefault(require("./server"));
console.log('Started application');
console.log("Cache all: ", process.env.CACHE_ALL);
(0, server_1.default)();
