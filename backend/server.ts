import http from 'http'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { Server } from 'socket.io'
import gameRouter from './controllers/gameRouter'
import { config } from './tools/config';

const port = config.port || 3001

const createServer = () => {
    const app = express()
    app.use(express.json())
    app.use(express.static('build'))
    app.use(cors())
    app.use(morgan('tiny'))
    app.use('/api/game', gameRouter)
    const server = http.createServer(app)
    const io = new Server(server)
    io.on('connection', client => {
        client.on('event', data => { /* … */ })
        client.on('disconnect', () => { client.disconnect(true) })
    })
    server.listen(port, () => console.log(`Server running on port ${port}`))
}

export default createServer