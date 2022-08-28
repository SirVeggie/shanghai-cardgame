
import createServer from './server';
import { config } from './tools/config';

console.log('Started application')
console.log("Cache all: ", config.cacheAll)

createServer()
