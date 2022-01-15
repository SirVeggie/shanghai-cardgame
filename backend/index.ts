//import dotenv from 'dotenv'
import { getGame, getState, startGame, handleAction } from './game/shanghai'
import { getDefaultConfiguration, testConfig } from './game/shanghaiGameConfig'

//dotenv.config()

const test = () => {
    startGame({ options: getDefaultConfiguration() })
}

test()

import createServer from './server';

console.log('Started application')
console.log("Cache all: ", process.env.CACHE_ALL)

createServer()


