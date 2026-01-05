import sql from "mssql";
export declare class StatusService {
    createStatus(statusData: any): Promise<any>;
    getActiveStatuses(): Promise<sql.IRecordSet<any>>;
    deleteStatus(statusId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=status.service.d.ts.map