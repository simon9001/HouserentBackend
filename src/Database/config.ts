import sql from "mssql";
import { env, validateEnv } from "./envConfig.js";

// Validate environment variables on startup
validateEnv();

export const Config = {
    port: env.PORT,
    sqlConfig: {
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        server: env.DB_SERVER,
        database: env.DB_DATABASE,
        port: env.DB_PORT,
        connectionTimeout: 15000,
        requestTimeout: 15000,
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
        },
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true,
        },
    },
};

let connectionPool: sql.ConnectionPool | null = null;

const initializeDatabaseConnection = async () => {
    if (connectionPool && connectionPool.connected) {
        console.log("Using Existing Database Connection");
        return connectionPool;
    }

    try {
        connectionPool = await sql.connect(Config.sqlConfig);
        console.log("✅ Connected to MSSQL Database:", env.DB_DATABASE);
        return connectionPool;
    } catch (error) {
        console.error("❌ Database connection error:", error);
        throw error;
    }
};

export const getConnectionPool = (): sql.ConnectionPool => {
    if (!connectionPool || !connectionPool.connected) {
        throw new Error("Database not connected. Call initializeDatabaseConnection first.");
    }
    return connectionPool;
};

export default initializeDatabaseConnection;