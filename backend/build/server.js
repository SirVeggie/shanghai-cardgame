"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const gameRouter_1 = __importDefault(require("./controllers/gameRouter"));
const port = process.env.PORT || 3001;
const createServer = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use(express_1.default.static('build'));
    app.use((0, cors_1.default)());
    app.use((0, morgan_1.default)('tiny'));
    app.use('/api/game', gameRouter_1.default);
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server);
    io.on('connection', client => {
        client.on('event', data => { });
        client.on('disconnect', () => { client.disconnect(true); });
    });
    server.listen(port, () => console.log(`Server running on port ${port}`));
};
exports.default = createServer;
