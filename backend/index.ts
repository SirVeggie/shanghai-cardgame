import dotenv from 'dotenv'
dotenv.config()

import createServer from './server';

console.log('Started application')
console.log("Cache all: ", process.env.CACHE_ALL)

createServer()