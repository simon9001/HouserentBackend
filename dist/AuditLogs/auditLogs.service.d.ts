export interface AuditLog {
    LogId: string;
    UserId?: string;
    Action: string;
    Entity: string;
    EntityId?: string;
    IpAddress?: string;
    UserAgent?: string;
    Metadata?: string;
    CreatedAt: Date;
}
export interface CreateAuditLogInput {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
}
export declare class AuditLogsService {
    private db;
    constructor();
    private getDb;
    createLog(data: CreateAuditLogInput): Promise<AuditLog>;
    getLogById(logId: string): Promise<AuditLog & {
        UserName?: string;
    }>;
    getLogsByUserId(userId: string, limit?: number, offset?: number): Promise<{
        logs: AuditLog[];
        total: number;
    }>;
    getLogsByEntity(entity: string, entityId?: string, limit?: number, offset?: number): Promise<{
        logs: Array<AuditLog & {
            UserName?: string;
        }>;
        total: number;
    }>;
    searchLogs(searchTerm: string, userId?: string, entity?: string, startDate?: Date, endDate?: Date, limit?: number, offset?: number): Promise<{
        logs: Array<AuditLog & {
            UserName?: string;
        }>;
        total: number;
    }>;
    getAuditStatistics(startDate?: Date, endDate?: Date): Promise<{
        totalLogs: number;
        logsByUser: Array<{
            userId: string;
            userName: string;
            count: number;
        }>;
        logsByEntity: Array<{
            entity: string;
            count: number;
        }>;
        logsByAction: Array<{
            action: string;
            count: number;
        }>;
        dailyActivity: Array<{
            date: string;
            count: number;
        }>;
    }>;
    cleanOldLogs(daysToKeep?: number): Promise<number>;
}
export declare const auditLogsService: AuditLogsService;
//# sourceMappingURL=auditLogs.service.d.ts.map