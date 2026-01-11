export interface PropertyVisit {
    visit_id: string;
    property_id: string;
    tenant_id: string;
    agent_id: string;
    visit_date: string;
    visit_purpose: string;
    tenant_notes: string;
    agent_notes: string;
    check_in_time: string | null;
    check_out_time: string | null;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'NO_SHOW';
    created_at: string;
    updated_at: string;
    property_title?: string;
    tenant_name?: string;
    agent_name?: string;
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
    status?: PropertyVisit['status'];
    checkInTime?: Date;
    checkOutTime?: Date;
}
export declare class PropertyVisitsService {
    checkIn(visitId: string): Promise<boolean>;
    checkOut(visitId: string): Promise<boolean>;
    createVisit(data: CreateVisitInput): Promise<PropertyVisit>;
    getVisitById(visitId: string): Promise<PropertyVisit | null>;
    getVisitsByPropertyId(propertyId: string, status?: string): Promise<PropertyVisit[]>;
    getVisitsByUserId(userId: string, role?: 'tenant' | 'agent'): Promise<PropertyVisit[]>;
    updateVisit(visitId: string, data: UpdateVisitInput): Promise<PropertyVisit>;
    cancelVisit(visitId: string, reason?: string): Promise<boolean>;
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
    markAsNoShow(visitId: string): Promise<boolean>;
    confirmVisit(visitId: string, agentNotes?: string): Promise<boolean>;
    getVisitsByDateRange(startDate: Date, endDate: Date): Promise<PropertyVisit[]>;
}
export declare const propertyVisitsService: PropertyVisitsService;
//# sourceMappingURL=propertyVisits.service.d.ts.map