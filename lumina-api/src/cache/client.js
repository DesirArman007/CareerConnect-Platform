import {Redis} from "ioredis";
const createClient = new Redis();

const client = new Redis({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});


client.on("connect",() => console.info("Cache is connecting"));
client.on("ready",() => console.info("Cache is ready"));
client.on("end",() => console.info("Cache is disconnected"));
client.on("reconnecting",() => console.info("Cache is reconnecting"));
client.on('error', err => console.log('Redis Client Error', err));


export default client;