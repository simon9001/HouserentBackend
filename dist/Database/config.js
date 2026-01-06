import sql from "mssql";
import { env, validateEnv } from "./envConfig.js";
// Validate environment variables on startup
validateEnv();
// Reliable Azure detection (NODE_ENV is not reliable on App Service)
const isAzure = !!process.env.WEBSITE_INSTANCE_ID;
export const Config = {
    port: Number(env.PORT) || 3000,
    // Local / non-Azure SQL configuration
    sqlConfig: {
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        server: env.DB_SERVER,
        database: env.DB_DATABASE,
        port: Number(env.DB_PORT) || 1433,
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
    // Azure SQL configuration (encryption REQUIRED)
    azureConfig: {
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        server: env.DB_SERVER,
        database: env.DB_DATABASE,
        port: Number(env.DB_PORT) || 1433,
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
        console.log("🔁 Using existing database connection pool");
        return connectionPool;
    }
    try {
        const dbConfig = isAzure ? Config.azureConfig : Config.sqlConfig;
        console.log(`🔌 Initializing ${isAzure ? "Azure SQL" : "Local SQL"} connection...`);
        connectionPool = await sql.connect(dbConfig);
        console.log(`✅ Connected to ${isAzure ? "Azure SQL" : "Local SQL"} database:`, env.DB_DATABASE);
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