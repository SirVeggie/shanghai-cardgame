//import dotenv from 'dotenv'
import { getGame, getState, startGame, handleAction } from './game/shanghai'
import { getDefaultConfiguration, testConfig } from './game/shanghaiGameConfig'

//dotenv.config()

const test = () => {
    startGame(testConfig())
    console.log(getState().players)
    console.log(JSON.stringify(getState(), null, 2))
    console.log(handleAction({
        playerName: "Eetu",
        setReady: true
    }))
    console.log(handleAction({
        playerName: "Niko",
        setReady: true
    }))
    console.log(handleAction({
        playerName: "Veikka",
        setReady: true
    }))
    console.log(handleAction({
        playerName: "Johannes",
        setReady: true
    }))
    console.log(JSON.stringify(getState(), null, 2))
    console.log(handleAction({
        playerName: "Eetu",
        meld: {
            melds: [
                {
                    cardIDs: [1, 2, 3, 4, 5]
                }
            ]
        }
    }))
    console.log(JSON.stringify(getState(), null, 2))
}

test()

// import createServer from './server';

// console.log('Started application')
// console.log("Cache all: ", process.env.CACHE_ALL)

// createServer()


