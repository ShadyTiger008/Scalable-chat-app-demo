import { Server } from 'socket.io'
import Redis from 'ioredis';
import prismaClient from './prisma';

const pub = new Redis({
    port: 24669,
    host: 'redis-29bf65eb-chatterjeesoumyajeet-648a.a.aivencloud.com',
    username: 'default',
    password: 'AVNS_Z4854jfGjTCoOcYn1rk',
     tls: {
        rejectUnauthorized: false, // You might need to adjust this based on your setup
    },
});

const sub = new Redis({
    port: 24669,
    host: 'redis-29bf65eb-chatterjeesoumyajeet-648a.a.aivencloud.com',
    username: 'default',
    password: 'AVNS_Z4854jfGjTCoOcYn1rk',
     tls: {
        rejectUnauthorized: false, // You might need to adjust this based on your setup
    },
})

class SocketService {
    private _io: Server;

    constructor() {
        console.log("Initialized Socket Service");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
                // methods: ["GET", "POST"]
            }
        });
        sub.subscribe('MESSAGES');
    }

    get io() {
        return this._io
    }

    public initListener() {
        const io = this._io;
        console.log("Intiazlized socket io listener");
        
        io.on("connect", (socket) => {
            console.log("New socket connected", socket.id);
            socket.on("event:message", async ({ message }: { message: string }) => {
                console.log("New message received: ", message);
                await pub.publish('MESSAGES', JSON.stringify({message}))
            })
        })

        sub.on("message", async (channel, message) => {
            if (channel === 'MESSAGES') {
                console.log("New message from redis: ", message);
                io.emit('message', { channel: channel, message: message })
                await prismaClient.message.create({
                    data: {
                        text: message
                    }
                })
            }
        })
    }
}

export default SocketService;