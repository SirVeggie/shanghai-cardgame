import 'dotenv/config';

export const config = {
    port: Number(process.env.PORT) || 3001,
    cacheAll: Boolean(process.env.CACHE_ALL) ?? true
};