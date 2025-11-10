import { createClient } from 'redis';

const redisClient = createClient({
    username: 'default',
    password: 'YYpvPjWB8rmAYVfn5bCimEgBnbiVVkqP',
    socket: {
        host: `${process.env.REDIS_HOST}`,
        port: process.env.REDIS_PORT,
        connectTimeout: 10000
    }
});

export default redisClient;