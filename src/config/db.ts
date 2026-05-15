import { Pool } from "pg";
import { DATABASE_URL } from "./env";

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

export const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Event listeners for pool
pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
});

export const getDb = async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Connected to PostgreSQL database");
        return client;
    } catch (err) {
        console.error("❌ Failed to connect to database:", err);
        throw err;
    }
};

export default pool;