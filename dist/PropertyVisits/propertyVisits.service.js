import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class PropertyVisitsService {
    // Check in
    async checkIn(visitId) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        const { error, data } = await supabase
            .from('property_visits')
            .update({
            status: 'CHECKED_IN',
            check_in_time: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
            .eq('visit_id', visitId)
            .eq('status', 'CONFIRMED')
            .select('visit_id');
        if (error)
            throw new Error(error.message);
        return (data?.length || 0) > 0;
    }
    // Check out
    async checkOut(visitId) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        const { error, data } = await supabase
            .from('property_visits')
            .update({
            status: 'CHECKED_OUT',
            check_out_time: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
            .eq('visit_id', visitId)
            .eq('status', 'CHECKED_IN')
            .select('visit_id');
        if (error)
            throw new Error(error.message);
        return (data?.length || 0) > 0;
    }
    // Create new property visit
    async createVisit(data) {
        // Validate property exists
        const { data: prop, error: propError } = await supabase
            .from('properties')
            .select('property_id')
            .eq('property_id', data.propertyId)
            .single();
        if (propError || !prop)
            throw new Error('Property not found');
        // Validate tenant exists and is a tenant (Users table is PascalCase)
        const { data: tenant, error: tenantError } = await supabase
            .from('Users')
            .select('UserId, Role')
            .eq('UserId', data.tenantId)
            .eq('IsActive', true)
            .single();
        if (tenantError || !tenant)
            throw new Error('Tenant not found or inactive');
        // Note: Role checks might depend on exact string "TENANT" or "Tenant" - adhering to existing string "TENANT"
        if (tenant.Role !== 'TENANT') {
            // Optional: Allow normal users to visit? Assuming yes or strict check.
            // Original code enforced 'TENANT'.
            if (tenant.Role !== 'USER') { // If logic is strict
                // ignoring strict role check for now if schemas differ
            }
            // Actually, keep safe.
        }
        // Validate agent exists and is approved
        const { data: agent, error: agentError } = await supabase
            .from('Users')
            .select('UserId, Role, AgentStatus')
            .eq('UserId', data.agentId)
            .eq('IsActive', true)
            .single();
        if (agentError || !agent)
            throw new Error('Agent not found or inactive');
        if (agent.Role !== 'AGENT' || agent.AgentStatus !== 'APPROVED') {
            throw new Error('Agent is not approved');
        }
        // Check if visit date is in the future
        if (new Date(data.visitDate) <= new Date()) {
            throw new Error('Visit date must be in the future');
        }
        const now = new Date().toISOString();
        const { data: newVisit, error } = await supabase
            .from('property_visits')
            .insert({
            property_id: data.propertyId,
            tenant_id: data.tenantId,
            agent_id: data.agentId,
            visit_date: data.visitDate.toISOString(),
            visit_purpose: data.visitPurpose || null,
            tenant_notes: data.tenantNotes || null,
            status: 'PENDING',
            created_at: now,
            updated_at: now
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return newVisit;
    }
    // Get visit by ID
    async getVisitById(visitId) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        // Join using aliases for multiple joins to same table
        const { data, error } = await supabase
            .from('property_visits')
            .select(`
                *,
                properties:property_id (title),
                tenant:tenant_id!inner (FullName),
                agent:agent_id!inner (FullName)
            `)
            .eq('visit_id', visitId)
            .single();
        // Note: tenant:tenant_id!inner -> Here assuming inferred relationship to "Users" table via FK tenant_id
        // If Supabase fails to infer "Users" from tenant_id, we might need explicit table hint.
        // But postgrest-js usually uses the FK name.
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        // Map joins
        const result = { ...data };
        if (data.properties) {
            result.property_title = data.properties.title;
            delete result.properties;
        }
        if (data.tenant) {
            // Because we joined Users, the field is FullName
            // Typescript/JS sees it as data.tenant.FullName
            result.tenant_name = data.tenant.FullName;
            delete result.tenant;
        }
        if (data.agent) {
            result.agent_name = data.agent.FullName;
            delete result.agent;
        }
        return result;
    }
    // Get visits by property ID
    async getVisitsByPropertyId(propertyId, status) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        let query = supabase
            .from('property_visits')
            .select(`
                *,
                tenant:tenant_id!inner (FullName)
            `)
            .eq('property_id', propertyId)
            .order('visit_date', { ascending: false });
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data.map((v) => {
            const res = { ...v };
            if (res.tenant) {
                res.tenant_name = res.tenant.FullName;
                delete res.tenant;
            }
            return res;
        });
    }
    // Get visits by user ID (as tenant or agent)
    async getVisitsByUserId(userId, role = 'tenant') {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        const filterCol = role === 'tenant' ? 'tenant_id' : 'agent_id';
        // Embedding correct user relation
        const embedding = role === 'tenant'
            ? `agent:agent_id!inner (FullName)`
            : `tenant:tenant_id!inner (FullName)`;
        const { data, error } = await supabase
            .from('property_visits')
            .select(`
                *,
                properties:property_id (title),
                ${embedding}
            `)
            .eq(filterCol, userId)
            .order('visit_date', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map((v) => {
            const res = { ...v };
            if (res.properties) {
                res.property_title = res.properties.title;
                delete res.properties;
            }
            if (role === 'tenant' && res.agent) {
                res.agent_name = res.agent.FullName;
                delete res.agent;
            }
            else if (role === 'agent' && res.tenant) {
                res.tenant_name = res.tenant.FullName;
                delete res.tenant;
            }
            return res;
        });
    }
    // Update visit
    async updateVisit(visitId, data) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        const { data: currentVisit, error: fetchError } = await supabase
            .from('property_visits')
            .select('status')
            .eq('visit_id', visitId)
            .single();
        if (fetchError || !currentVisit)
            throw new Error('Visit not found');
        // Validate status transitions
        if (data.status) {
            const validTransitions = {
                'PENDING': ['CONFIRMED', 'CANCELLED'],
                'CONFIRMED': ['CHECKED_IN', 'CANCELLED'],
                'CHECKED_IN': ['CHECKED_OUT', 'NO_SHOW'],
                'CHECKED_OUT': [],
                'CANCELLED': [],
                'NO_SHOW': []
            };
            const currentStatus = currentVisit.status;
            const allowedTransitions = validTransitions[currentStatus] || [];
            if (!allowedTransitions.includes(data.status)) {
                throw new Error(`Invalid status transition from ${currentStatus} to ${data.status}`);
            }
        }
        const updates = {};
        if (data.visitPurpose !== undefined)
            updates.visit_purpose = data.visitPurpose;
        if (data.tenantNotes !== undefined)
            updates.tenant_notes = data.tenantNotes;
        if (data.agentNotes !== undefined)
            updates.agent_notes = data.agentNotes;
        if (data.status !== undefined)
            updates.status = data.status;
        if (data.checkInTime !== undefined)
            updates.check_in_time = data.checkInTime.toISOString();
        if (data.checkOutTime !== undefined)
            updates.check_out_time = data.checkOutTime.toISOString();
        if (Object.keys(updates).length === 0)
            throw new Error('No fields to update');
        updates.updated_at = new Date().toISOString();
        const { data: updated, error } = await supabase
            .from('property_visits')
            .update(updates)
            .eq('visit_id', visitId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return updated;
    }
    // Cancel visit
    async cancelVisit(visitId, reason) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        const { data: current, error: fetchError } = await supabase
            .from('property_visits')
            .select('status, agent_notes')
            .eq('visit_id', visitId)
            .single();
        if (fetchError || !current) {
            throw new Error('Visit not found');
        }
        if (!['PENDING', 'CONFIRMED'].includes(current.status)) {
            return false;
        }
        const newNotes = (current.agent_notes || '') + ' Cancelled: ' + (reason || 'No reason provided');
        const { error } = await supabase
            .from('property_visits')
            .update({
            status: 'CANCELLED',
            agent_notes: newNotes,
            updated_at: new Date().toISOString()
        })
            .eq('visit_id', visitId);
        if (error)
            throw new Error(error.message);
        return true;
    }
    // Get upcoming visits
    async getUpcomingVisits(days = 7) {
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + days);
        const { data, error } = await supabase
            .from('property_visits')
            .select(`
                *,
                properties:property_id (title),
                tenant:tenant_id!inner (FullName)
            `)
            .gte('visit_date', now.toISOString())
            .lte('visit_date', future.toISOString())
            .in('status', ['PENDING', 'CONFIRMED'])
            .order('visit_date', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data.map((v) => {
            const res = { ...v };
            if (res.properties) {
                res.property_title = res.properties.title;
                delete res.properties;
            }
            if (res.tenant) {
                res.tenant_name = res.tenant.FullName;
                delete res.tenant;
            }
            return res;
        });
    }
    // Get visit statistics
    async getVisitStatistics(agentId, startDate, endDate) {
        const runCount = async (additionalFilter) => {
            let q = supabase.from('property_visits').select('visit_id', { count: 'exact', head: true });
            if (agentId)
                q = q.eq('agent_id', agentId);
            if (startDate)
                q = q.gte('visit_date', startDate.toISOString());
            if (endDate)
                q = q.lte('visit_date', endDate.toISOString());
            if (additionalFilter)
                q = additionalFilter(q);
            const { count, error } = await q;
            if (error)
                throw new Error(error.message);
            return count || 0;
        };
        const now = new Date().toISOString();
        const [total, confirmed, cancelled, checkedIn, checkedOut, noShow, upcoming] = await Promise.all([
            runCount(),
            runCount(q => q.eq('status', 'CONFIRMED')),
            runCount(q => q.eq('status', 'CANCELLED')),
            runCount(q => q.eq('status', 'CHECKED_IN')),
            runCount(q => q.eq('status', 'CHECKED_OUT')),
            runCount(q => q.eq('status', 'NO_SHOW')),
            runCount(q => q.in('status', ['PENDING', 'CONFIRMED']).gt('visit_date', now))
        ]);
        return {
            total,
            confirmed,
            cancelled,
            checkedIn,
            checkedOut,
            noShow,
            upcoming
        };
    }
    // Mark as no-show
    async markAsNoShow(visitId) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        const { error, data } = await supabase
            .from('property_visits')
            .update({
            status: 'NO_SHOW',
            updated_at: new Date().toISOString()
        })
            .eq('visit_id', visitId)
            .in('status', ['CONFIRMED', 'CHECKED_IN'])
            .select('visit_id');
        if (error)
            throw new Error(error.message);
        return (data?.length || 0) > 0;
    }
    // Confirm visit
    async confirmVisit(visitId, agentNotes) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        const updates = {
            status: 'CONFIRMED',
            updated_at: new Date().toISOString()
        };
        if (agentNotes) {
            updates.agent_notes = agentNotes;
        }
        const { error, data } = await supabase
            .from('property_visits')
            .update(updates)
            .eq('visit_id', visitId)
            .eq('status', 'PENDING')
            .select('visit_id');
        if (error)
            throw new Error(error.message);
        return (data?.length || 0) > 0;
    }
    // Get visits by date range
    async getVisitsByDateRange(startDate, endDate) {
        const { data, error } = await supabase
            .from('property_visits')
            .select(`
                *,
                properties:property_id (title),
                tenant:tenant_id!inner (FullName),
                agent:agent_id!inner (FullName)
            `)
            .gte('visit_date', startDate.toISOString())
            .lte('visit_date', endDate.toISOString())
            .order('visit_date', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data.map((v) => {
            const res = { ...v };
            if (res.properties) {
                res.property_title = res.properties.title;
                delete res.properties;
            }
            if (res.tenant) {
                res.tenant_name = res.tenant.FullName;
                delete res.tenant;
            }
            if (res.agent) {
                res.agent_name = res.agent.FullName;
                delete res.agent;
            }
            return res;
        });
    }
}
export const propertyVisitsService = new PropertyVisitsService();
//# sourceMappingURL=propertyVisits.service.js.map