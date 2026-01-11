import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class PropertyVisitsService {
    // Create new property visit
    async createVisit(data) {
        // Validate property exists
        const { data: prop, error: propError } = await supabase
            .from('Properties')
            .select('PropertyId')
            .eq('PropertyId', data.propertyId)
            .single();
        if (propError || !prop)
            throw new Error('Property not found');
        // Validate tenant exists and is a tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('Users')
            .select('UserId, Role')
            .eq('UserId', data.tenantId)
            .eq('IsActive', true)
            .single();
        if (tenantError || !tenant)
            throw new Error('Tenant not found or inactive');
        if (tenant.Role !== 'TENANT')
            throw new Error('User is not a tenant');
        // Validate agent exists and is approved
        const { data: agent, error: agentError } = await supabase
            .from('Users')
            .select('UserId, Role, AgentStatus')
            .eq('UserId', data.agentId)
            .eq('IsActive', true)
            .single();
        if (agentError || !agent)
            throw new Error('Agent not found or inactive');
        // Assuming AgentStatus check is required.
        // Supabase query case sensitive? AgentStatus usually uppercase.
        if (agent.Role !== 'AGENT' || agent.AgentStatus !== 'APPROVED') {
            throw new Error('Agent is not approved');
        }
        // Check if visit date is in the future
        if (new Date(data.visitDate) <= new Date()) {
            throw new Error('Visit date must be in the future');
        }
        const { data: newVisit, error } = await supabase
            .from('PropertyVisits')
            .insert({
            PropertyId: data.propertyId,
            TenantId: data.tenantId,
            AgentId: data.agentId,
            VisitDate: data.visitDate.toISOString(),
            VisitPurpose: data.visitPurpose || null,
            TenantNotes: data.tenantNotes || null,
            Status: 'PENDING',
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString()
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
        const { data, error } = await supabase
            .from('PropertyVisits')
            .select(`
                *,
                Properties:PropertyId (Title),
                Tenant:TenantId (FullName),
                Agent:AgentId (FullName)
            `)
            .eq('VisitId', visitId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        // Map joins
        const result = { ...data };
        if (data.Properties) {
            result.PropertyTitle = data.Properties.Title;
            delete result.Properties;
        }
        // Tenant/Agent are aliases for Users table relation
        // We need to ensure aliases work in config or if relying on Relation names.
        // Assuming 'Tenant' and 'Agent' relations are set up or we rely on User:TenantId logic.
        // Supabase JS often needs precise relation name or standard naming.
        // If relations are not named, we use `Users!TenantId(FullName)`.
        // Re-query with specific embedding syntax that is safer:
        // `Tenant:Users!TenantId (FullName)`, `Agent:Users!AgentId (FullName)`
        // BUT if FK name matches User, it might auto-detect.
        // Let's assume standard embedding: `Users!TenantId`.
        return this.mapVisitJoins(data);
    }
    // Check internal mapping helper
    mapVisitJoins(data) {
        const res = { ...data };
        // Handle potentially different shape depending on query
        if (res.Properties) {
            res.PropertyTitle = res.Properties.Title;
            delete res.Properties;
        }
        // If we used aliases in query:
        if (res.Tenant) { // From Tenant:Users!TenantId
            res.TenantName = res.Tenant.FullName;
            delete res.Tenant;
        }
        else if (res.Users) {
            // If multiple users joined without alias, it becomes an array or object, complicated.
            // I will use explicit aliases in queries below.
        }
        if (res.Agent) {
            res.AgentName = res.Agent.FullName;
            delete res.Agent;
        }
        return res;
    }
    // Get visits by property ID
    async getVisitsByPropertyId(propertyId, status) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        let query = supabase
            .from('PropertyVisits')
            .select(`
                *,
                Tenant:TenantId (FullName)
            `) // Tenant name needed
            .eq('PropertyId', propertyId)
            .order('VisitDate', { ascending: false });
        if (status) {
            query = query.eq('Status', status);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        // Map relations
        // We only fetched Tenant name per requirement `u.FullName as TenantName`
        return data.map((v) => {
            const res = { ...v };
            if (res.Tenant) { // Supabase returns object for foreign key alias
                res.TenantName = res.Tenant.FullName; // Assuming Tenant is `Users`
                delete res.Tenant;
            }
            else if (res.Users) { // Fallback if alias failed
                if (Array.isArray(res.Users)) {
                    // Should not happen with single FK unless misconfigured
                }
                else {
                    res.TenantName = res.Users.FullName;
                }
                delete res.Users;
            }
            return res;
        });
    }
    // Get visits by user ID (as tenant or agent)
    async getVisitsByUserId(userId, role = 'tenant') {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        // We need PropertyTitle, and Counterpart Name.
        // If role=tenant, fetch Agent Name.
        // If role=agent, fetch Tenant Name.
        const counterpartAlias = role === 'tenant' ? 'Agent' : 'Tenant';
        const counterpartFk = role === 'tenant' ? 'AgentId' : 'TenantId';
        const filterCol = role === 'tenant' ? 'TenantId' : 'AgentId';
        // Construct query
        // select = *, Properties(Title), Counterpart:CounterpartFK (FullName)
        // Note: Supabase embedding: `Users!FK`
        // We use alias: `Users!AgentId` -> `Agent`
        // Wait, `Users!AgentId` works? `Users!PropertyVisits_AgentId_fkey` maybe needed if ambiguous.
        // I will try simple `Users!AgentId` 
        const embedding = role === 'tenant'
            ? `Agent:Users!AgentId (FullName)`
            : `Tenant:Users!TenantId (FullName)`;
        const { data, error } = await supabase
            .from('PropertyVisits')
            .select(`
                *,
                Properties:PropertyId (Title),
                ${embedding}
            `)
            .eq(filterCol, userId)
            .order('VisitDate', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map((v) => {
            const res = { ...v };
            if (res.Properties) {
                res.PropertyTitle = res.Properties.Title;
                delete res.Properties;
            }
            if (role === 'tenant' && res.Agent) {
                res.AgentName = res.Agent.FullName;
                delete res.Agent;
            }
            else if (role === 'agent' && res.Tenant) {
                res.TenantName = res.Tenant.FullName;
                delete res.Tenant;
            }
            return res;
        });
    }
    // Update visit
    async updateVisit(visitId, data) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        // Get current visit with fully qualified getter
        // Note: We need just the status first efficiently? Or minimal fields.
        // But `getVisitById` is fine, we need to return full object anyway potentially?
        // Actually we need to return updated object.
        const { data: currentVisit, error: fetchError } = await supabase
            .from('PropertyVisits')
            .select('Status')
            .eq('VisitId', visitId)
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
            const currentStatus = currentVisit.Status;
            const allowedTransitions = validTransitions[currentStatus] || [];
            if (!allowedTransitions.includes(data.status)) {
                throw new Error(`Invalid status transition from ${currentStatus} to ${data.status}`);
            }
        }
        const updates = {};
        if (data.visitPurpose !== undefined)
            updates.VisitPurpose = data.visitPurpose;
        if (data.tenantNotes !== undefined)
            updates.TenantNotes = data.tenantNotes;
        if (data.agentNotes !== undefined)
            updates.AgentNotes = data.agentNotes;
        if (data.status !== undefined)
            updates.Status = data.status;
        if (data.checkInTime !== undefined)
            updates.CheckInTime = data.checkInTime.toISOString();
        if (data.checkOutTime !== undefined)
            updates.CheckOutTime = data.checkOutTime.toISOString();
        if (Object.keys(updates).length === 0)
            throw new Error('No fields to update');
        updates.UpdatedAt = new Date().toISOString();
        const { data: updated, error } = await supabase
            .from('PropertyVisits')
            .update(updates)
            .eq('VisitId', visitId)
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
        // We can use a raw RPC or logic. 
        // Logic: Get current, check status, update.
        // Supabase update with filter:
        // Fetch first to get existing notes? 
        // Logic: `AgentNotes = ISNULL(AgentNotes, '') + ' Cancelled: ' + @reason`
        // Concat is hard in simple update.
        // Fetch -> modify -> update.
        const { data: current, error: fetchError } = await supabase
            .from('PropertyVisits')
            .select('Status, AgentNotes')
            .eq('VisitId', visitId)
            .single();
        if (fetchError || !current) {
            throw new Error('Visit not found'); // Or return false
        }
        if (!['PENDING', 'CONFIRMED'].includes(current.Status)) {
            // Logic says `WHERE ... Status IN ...` so if not matching, rowsAffected=0.
            // We can return false.
            return false;
        }
        const newNotes = (current.AgentNotes || '') + ' Cancelled: ' + (reason || 'No reason provided');
        const { error } = await supabase
            .from('PropertyVisits')
            .update({
            Status: 'CANCELLED',
            AgentNotes: newNotes,
            UpdatedAt: new Date().toISOString()
        })
            .eq('VisitId', visitId);
        if (error)
            throw new Error(error.message);
        return true;
    }
    // Check in
    async checkIn(visitId) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        const { error, count } = await supabase
            .from('PropertyVisits')
            .update({
            Status: 'CHECKED_IN',
            CheckInTime: new Date().toISOString(),
            UpdatedAt: new Date().toISOString()
        })
            .eq('VisitId', visitId)
            .eq('Status', 'CONFIRMED')
            .select('VisitId', { count: 'exact' }); // Get count to simulate rowsAffected
        if (error)
            throw new Error(error.message);
        // Supabase update returns updated rows if select() used.
        // count should be 1 if updated
        return (count || 0) > 0;
    }
    // Check out
    async checkOut(visitId) {
        if (!ValidationUtils.isValidUUID(visitId))
            throw new Error('Invalid visit ID format');
        const { error, count } = await supabase
            .from('PropertyVisits')
            .update({
            Status: 'CHECKED_OUT',
            CheckOutTime: new Date().toISOString(),
            UpdatedAt: new Date().toISOString()
        })
            .eq('VisitId', visitId)
            .eq('Status', 'CHECKED_IN')
            .select('VisitId', { count: 'exact' });
        if (error)
            throw new Error(error.message);
        return (count || 0) > 0;
    }
    // Get upcoming visits
    async getUpcomingVisits(days = 7) {
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + days);
        const { data, error } = await supabase
            .from('PropertyVisits')
            .select(`
                *,
                Properties:PropertyId (Title),
                Tenant:TenantId (FullName)
            `)
            .gte('VisitDate', now.toISOString())
            .lte('VisitDate', future.toISOString())
            .in('Status', ['PENDING', 'CONFIRMED'])
            .order('VisitDate', { ascending: true });
        if (error)
            throw new Error(error.message);
        return data.map((v) => {
            const res = { ...v };
            if (res.Properties) {
                res.PropertyTitle = res.Properties.Title;
                delete res.Properties;
            }
            if (res.Tenant) {
                res.TenantName = res.Tenant.FullName;
                delete res.Tenant;
            }
            return res;
        });
    }
    // Get visit statistics
    async getVisitStatistics(agentId, startDate, endDate) {
        // Build base filters
        const filters = (query) => {
            if (agentId)
                query = query.eq('AgentId', agentId);
            if (startDate)
                query = query.gte('VisitDate', startDate.toISOString());
            if (endDate)
                query = query.lte('VisitDate', endDate.toISOString());
            return query;
        };
        const runCount = async (additionalFilter) => {
            let q = supabase.from('PropertyVisits').select('*', { count: 'exact', head: true });
            q = filters(q);
            if (additionalFilter)
                q = additionalFilter(q);
            const { count, error } = await q;
            if (error)
                throw new Error(error.message);
            return count || 0;
        };
        const [total, confirmed, cancelled, checkedIn, checkedOut, noShow, upcoming] = await Promise.all([
            runCount(),
            runCount(q => q.eq('Status', 'CONFIRMED')),
            runCount(q => q.eq('Status', 'CANCELLED')),
            runCount(q => q.eq('Status', 'CHECKED_IN')),
            runCount(q => q.eq('Status', 'CHECKED_OUT')),
            runCount(q => q.eq('Status', 'NO_SHOW')),
            runCount(q => q.in('Status', ['PENDING', 'CONFIRMED']).gt('VisitDate', new Date().toISOString()))
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
}
export const propertyVisitsService = new PropertyVisitsService();
//# sourceMappingURL=propertyVisits.service.js.map