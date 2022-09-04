import { startController } from './src/logic/controller';
import { createServer } from './src/networking/server';
import { createSocket } from './src/networking/socket';
import { config } from './src/tools/config';

const server = createServer(config.PORT);
createSocket(server);
startController();