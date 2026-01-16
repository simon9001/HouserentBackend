export interface SubscriptionPlan {
    PlanId: string;
    Name: string;
    DisplayName: string;
    Description?: string;
    BasePrice: number;
    Currency: string;
    BillingCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    TrialDays: number;
    MaxProperties: number;
    MaxVisitsPerMonth: number;
    MaxMediaPerProperty: number;
    MaxAmenitiesPerProperty: number;
    AllowBoost: boolean;
    MaxBoostsPerMonth: number;
    AllowPremiumSupport: boolean;
    AllowAdvancedAnalytics: boolean;
    AllowBulkOperations: boolean;
    IsActive: boolean;
    IsVisible: boolean;
    SortOrder: number;
    HighlightFeatures?: string[];
    CreatedAt: string;
    UpdatedAt: string;
}
export interface CreatePlanInput {
    name: string;
    displayName: string;
    description?: string;
    basePrice: number;
    currency?: string;
    billingCycle?: SubscriptionPlan['BillingCycle'];
    trialDays?: number;
    maxProperties?: number;
    maxVisitsPerMonth?: number;
    maxMediaPerProperty?: number;
    maxAmenitiesPerProperty?: number;
    allowBoost?: boolean;
    maxBoostsPerMonth?: number;
    allowPremiumSupport?: boolean;
    allowAdvancedAnalytics?: boolean;
    allowBulkOperations?: boolean;
    isVisible?: boolean;
    sortOrder?: number;
    highlightFeatures?: string[];
}
export interface UpdatePlanInput {
    displayName?: string;
    description?: string;
    basePrice?: number;
    isActive?: boolean;
    isVisible?: boolean;
    sortOrder?: number;
    highlightFeatures?: string[];
}
export declare class SubscriptionPlansService {
    private mapDBToPlan;
    createPlan(data: CreatePlanInput): Promise<SubscriptionPlan>;
    getPlanById(planId: string): Promise<SubscriptionPlan | null>;
    getPlanByName(name: string): Promise<SubscriptionPlan | null>;
    getAllPlans(isActive?: boolean, isVisible?: boolean): Promise<SubscriptionPlan[]>;
    updatePlan(planId: string, data: UpdatePlanInput): Promise<SubscriptionPlan>;
    deletePlan(planId: string): Promise<boolean>;
    comparePlans(planIds: string[]): Promise<SubscriptionPlan[]>;
    getFreePlan(): Promise<SubscriptionPlan | null>;
    getFeaturedPlans(limit?: number): Promise<SubscriptionPlan[]>;
}
export declare const subscriptionPlansService: SubscriptionPlansService;
//# sourceMappingURL=subscriptionPlans.service.d.ts.map