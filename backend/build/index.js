"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import dotenv from 'dotenv'
const shanghai_1 = require("./game/shanghai");
const shanghaiGameConfig_1 = require("./game/shanghaiGameConfig");
//dotenv.config()
const test = () => {
    (0, shanghai_1.startGame)((0, shanghaiGameConfig_1.testConfig)());
    console.log((0, shanghai_1.getState)().players);
    console.log(JSON.stringify((0, shanghai_1.getState)(), null, 2));
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
    console.log(JSON.stringify((0, shanghai_1.getState)(), null, 2));
    console.log((0, shanghai_1.handleAction)({
        playerName: "Eetu",
        meld: {
            melds: [
                {
                    cardIDs: [1, 2, 3, 4, 5]
                }
            ]
        }
    }));
    console.log(JSON.stringify((0, shanghai_1.getState)(), null, 2));
};
test();
// import createServer from './server';
// console.log('Started application')
// console.log("Cache all: ", process.env.CACHE_ALL)
// createServer()
