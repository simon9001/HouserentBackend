export interface PropertyVisit {
    VisitId: string;
    PropertyId: string;
    TenantId: string;
    AgentId: string;
    VisitDate: string;
    VisitPurpose: string;
    TenantNotes: string;
    AgentNotes: string;
    CheckInTime: string | null;
    CheckOutTime: string | null;
    Status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'NO_SHOW';
    CreatedAt: string;
    UpdatedAt: string;
    PropertyTitle?: string;
    TenantName?: string;
    AgentName?: string;
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
    createVisit(data: CreateVisitInput): Promise<PropertyVisit>;
    getVisitById(visitId: string): Promise<PropertyVisit | null>;
    private mapVisitJoins;
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