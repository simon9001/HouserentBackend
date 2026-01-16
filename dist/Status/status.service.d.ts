export declare class StatusService {
    createStatus(statusData: any): Promise<any>;
    getActiveStatuses(): Promise<any[]>;
    deleteStatus(statusId: string, userId: string): Promise<void>;
}
export declare const statusService: StatusService;
//# sourceMappingURL=status.service.d.ts.map