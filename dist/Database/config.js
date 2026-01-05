import sql from "mssql";
import { env, validateEnv } from "./envConfig.js";
// Validate environment variables on startup
validateEnv();
const isProduction = env.NODE_ENV === "production";
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
            encrypt: isProduction, // 🔑 key difference
            trustServerCertificate: !isProduction,
            enableArithAbort: true,
        },
    },
    //the updated config for azure database
    AzureConfig: {
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
            encrypt: true,
            trustServerCertificate: true,
            enableArithAbort: true,
        },
    },
};
let connectionPool = null;
const initializeDatabaseConnection = async () => {
    if (connectionPool && connectionPool.connected) {
        console.log("Using existing database connection");
        return connectionPool;
    }
    try {
        connectionPool = await sql.connect(Config.sqlConfig);
        console.log(`✅ Connected to ${process.env.NODE_ENV === "production" ? "Azure SQL" : "Local SQL"} Database:`, env.DB_DATABASE);
        return connectionPool;
    }
    catch (error) {
        console.error("❌ Database connection error:", error);
        throw error;
    }
};
export const getConnectionPool = () => {
    if (!connectionPool || !connectionPool.connected) {
        throw new Error("Database not connected. Call initializeDatabaseConnection first.");
    }
    return connectionPool;
};
export default initializeDatabaseConnection;
//# sourceMappingURL=config.js.map