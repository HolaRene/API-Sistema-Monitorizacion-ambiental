import { config } from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "development"}.local`;
config({
    path: envFile,
});

console.log(`Loading environment from: ${envFile}`);
console.log(`API_KEYS loaded: ${process.env.API_KEYS ? "✓" : "✗ UNDEFINED"}`);
console.log(`PORT: ${process.env.PORT}`);

export const { PORT, DATABASE_URL, API_KEYS, API_KEY_HEADER } = process.env;