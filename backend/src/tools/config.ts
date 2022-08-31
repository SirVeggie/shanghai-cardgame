import 'dotenv/config';

export const config = {
    PORT: Number(process.env.PORT),
};

for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
        throw `.env is missing ${key}`;
    }
}