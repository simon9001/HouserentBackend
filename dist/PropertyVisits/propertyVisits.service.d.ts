export interface PropertyVisit {
    VisitId: string;
    PropertyId: string;
    TenantId: string;
    AgentId: string;
    VisitDate: Date;
    VisitPurpose: string;
    TenantNotes: string;
    AgentNotes: string;
    CheckInTime: Date;
    CheckOutTime: Date;
    Status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'NO_SHOW';
    CreatedAt: Date;
    UpdatedAt: Date;
}
export interface CreateVisitInput {
    propertyId: string;
    tenantId: string;
    agentId: string;
    visitDate: Date;
    visitPurpose?: string;
    tenantNotes?: string;
}
export interface UpdateVisitInput {
    visitPurpose?: string;
    tenantNotes?: string;
    agentNotes?: string;
    status?: PropertyVisit['Status'];
    checkInTime?: Date;
    checkOutTime?: Date;
}
export declare class PropertyVisitsService {
    private db;
    constructor();
    private getDb;
    createVisit(data: CreateVisitInput): Promise<PropertyVisit>;
    getVisitById(visitId: string): Promise<PropertyVisit & {
        PropertyTitle?: string;
        TenantName?: string;
        AgentName?: string;
    }>;
    getVisitsByPropertyId(propertyId: string, status?: string): Promise<PropertyVisit[]>;
    getVisitsByUserId(userId: string, role?: 'tenant' | 'agent'): Promise<PropertyVisit[]>;
    updateVisit(visitId: string, data: UpdateVisitInput): Promise<PropertyVisit>;
    cancelVisit(visitId: string, reason?: string): Promise<boolean>;
    checkIn(visitId: string): Promise<boolean>;
    checkOut(visitId: string): Promise<boolean>;
    getUpcomingVisits(days?: number): Promise<PropertyVisit[]>;
    getVisitStatistics(agentId?: string, startDate?: Date, endDate?: Date): Promise<{
        total: number;
        confirmed: number;
        cancelled: number;
        checkedIn: number;
        checkedOut: number;
        noShow: number;
        upcoming: number;
    }>;
}
export declare const propertyVisitsService: PropertyVisitsService;
//# sourceMappingURL=propertyVisits.service.d.ts.map