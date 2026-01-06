import sql from "mssql";
export declare const Config: {
    port: number;
    sqlConfig: {
        user: string;
        password: string;
        server: string;
        database: string;
        port: number;
        connectionTimeout: number;
        requestTimeout: number;
        pool: {
            max: number;
            min: number;
            idleTimeoutMillis: number;
        };
        options: {
            encrypt: boolean;
            trustServerCertificate: boolean;
            enableArithAbort: boolean;
        };
    };
    azureConfig: {
        user: string;
        password: string;
        server: string;
        database: string;
        port: number;
        connectionTimeout: number;
        requestTimeout: number;
        pool: {
            max: number;
            min: number;
            idleTimeoutMillis: number;
        };
        options: {
            encrypt: boolean;
            trustServerCertificate: boolean;
            enableArithAbort: boolean;
        };
    };
};
declare const initializeDatabaseConnection: () => Promise<sql.ConnectionPool>;
export declare const getConnectionPool: () => sql.ConnectionPool;
export default initializeDatabaseConnection;
//# sourceMappingURL=config.d.ts.map