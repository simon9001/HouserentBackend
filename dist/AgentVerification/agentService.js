import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class AgentVerificationService {
    // Create new agent verification
    async createVerification(data) {
        // Validate user exists and is active
        const { data: users, error: userError } = await supabase
            .from('Users')
            .select('UserId, Role, AgentStatus')
            .eq('UserId', data.userId)
            .eq('IsActive', true);
        if (userError || !users || users.length === 0) {
            throw new Error('User not found or inactive');
        }
        const user = users[0];
        const userRole = user.Role?.toUpperCase();
        const agentStatus = user.AgentStatus?.toUpperCase();
        // Check if user is already an approved agent
        if (userRole === 'AGENT' && agentStatus === 'APPROVED') {
            throw new Error('You are already an approved agent');
        }
        // Check if user is admin
        if (userRole === 'ADMIN') {
            throw new Error('Administrators cannot apply to become agents');
        }
        // Check if user already has a pending verification
        const { data: existing, error: existingError } = await supabase
            .from('AgentVerification')
            .select('VerificationId')
            .eq('UserId', data.userId)
            .in('ReviewStatus', ['PENDING', 'APPROVED']);
        if (existing && existing.length > 0) {
            throw new Error('Agent verification already exists or is pending');
        }
        // Create verification
        const { data: newVerification, error: createError } = await supabase
            .from('AgentVerification')
            .insert({
            UserId: data.userId,
            NationalId: data.nationalId,
            SelfieUrl: data.selfieUrl,
            IdFrontUrl: data.idFrontUrl,
            IdBackUrl: data.idBackUrl || null,
            PropertyProofUrl: data.propertyProofUrl || null
        })
            .select()
            .single();
        if (createError)
            throw new Error(createError.message);
        // Update user's agent status to PENDING
        await supabase
            .from('Users')
            .update({ AgentStatus: 'PENDING', UpdatedAt: new Date().toISOString() })
            .eq('UserId', data.userId);
        return newVerification;
    }
    // Create verification by admin for a user
    async createVerificationForUser(data) {
        // Validate user exists and is active
        const { data: users, error: userError } = await supabase
            .from('Users')
            .select('UserId, Role, AgentStatus')
            .eq('UserId', data.userId)
            .eq('IsActive', true);
        if (userError || !users || users.length === 0) {
            throw new Error('User not found or inactive');
        }
        const user = users[0];
        const userRole = user.Role?.toUpperCase();
        const agentStatus = user.AgentStatus?.toUpperCase();
        // Check if user is already an approved agent
        if (userRole === 'AGENT' && agentStatus === 'APPROVED') {
            throw new Error('User is already an approved agent');
        }
        // Check if user already has a pending verification
        const { data: existing } = await supabase
            .from('AgentVerification')
            .select('VerificationId')
            .eq('UserId', data.userId)
            .in('ReviewStatus', ['PENDING', 'APPROVED']);
        if (existing && existing.length > 0) {
            throw new Error('Agent verification already exists or is pending');
        }
        // Create verification
        const { data: newVerification, error: createError } = await supabase
            .from('AgentVerification')
            .insert({
            UserId: data.userId,
            NationalId: data.nationalId,
            SelfieUrl: data.selfieUrl,
            IdFrontUrl: data.idFrontUrl,
            IdBackUrl: data.idBackUrl || null,
            PropertyProofUrl: data.propertyProofUrl || null
        })
            .select()
            .single();
        if (createError)
            throw new Error(createError.message);
        // Update user's agent status to PENDING
        await supabase
            .from('Users')
            .update({ AgentStatus: 'PENDING', UpdatedAt: new Date().toISOString() })
            .eq('UserId', data.userId);
        return newVerification;
    }
    // Get verification by ID
    async getVerificationById(verificationId) {
        if (!ValidationUtils.isValidUUID(verificationId))
            throw new Error('Invalid verification ID format');
        const { data, error } = await supabase
            .from('AgentVerification')
            .select(`
                *,
                Users:UserId (FullName, Email, PhoneNumber, Role, AgentStatus)
            `)
            .eq('VerificationId', verificationId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        // Transform to flat structure to match interface if needed
        const result = { ...data };
        if (data.Users) {
            result.UserFullName = data.Users.FullName;
            result.UserEmail = data.Users.Email;
            result.UserPhoneNumber = data.Users.PhoneNumber;
            result.UserRole = data.Users.Role;
            result.UserAgentStatus = data.Users.AgentStatus;
            delete result.Users; // Remove nested object
        }
        return result;
    }
    // Get verification by user ID
    async getVerificationByUserId(userId) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        const { data, error } = await supabase
            .from('AgentVerification')
            .select(`
                *,
                Users:UserId (FullName, Email, PhoneNumber, Role, AgentStatus)
            `)
            .eq('UserId', userId)
            .order('SubmittedAt', { ascending: false })
            .limit(1)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        const result = { ...data };
        if (data.Users) {
            result.UserFullName = data.Users.FullName;
            result.UserEmail = data.Users.Email;
            result.UserPhoneNumber = data.Users.PhoneNumber;
            result.UserRole = data.Users.Role;
            result.UserAgentStatus = data.Users.AgentStatus;
            delete result.Users;
        }
        return result;
    }
    // Get all verifications with pagination
    async getAllVerifications(page = 1, limit = 20, status) {
        const offset = (page - 1) * limit;
        let query = supabase
            .from('AgentVerification')
            .select(`
                *,
                Users:UserId (FullName, Email, PhoneNumber, Role, AgentStatus),
                Reviewer:ReviewedBy (FullName)
            `, { count: 'exact' });
        if (status) {
            query = query.eq('ReviewStatus', status);
        }
        const { data, count, error } = await query
            .order('SubmittedAt', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error)
            throw new Error(error.message);
        const verifications = data?.map((v) => {
            const result = { ...v };
            if (v.Users) {
                result.UserFullName = v.Users.FullName;
                result.UserEmail = v.Users.Email;
                result.UserPhoneNumber = v.Users.PhoneNumber;
                result.UserRole = v.Users.Role;
                result.UserAgentStatus = v.Users.AgentStatus;
                delete result.Users;
            }
            if (v.Reviewer) {
                result.ReviewerFullName = v.Reviewer.FullName;
                delete result.Reviewer;
            }
            return result;
        }) || [];
        return {
            verifications: verifications,
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        };
    }
    // Update verification (admin review)
    async updateVerification(verificationId, data, reviewerId) {
        if (!ValidationUtils.isValidUUID(verificationId))
            throw new Error('Invalid verification ID format');
        if (!ValidationUtils.isValidUUID(reviewerId))
            throw new Error('Invalid reviewer ID format');
        // Check if verification exists
        const { data: verification, error: fetchError } = await supabase
            .from('AgentVerification')
            .select('*')
            .eq('VerificationId', verificationId)
            .single();
        if (fetchError || !verification)
            throw new Error('Verification not found');
        const updates = {};
        if (data.reviewStatus) {
            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
            if (!validStatuses.includes(data.reviewStatus))
                throw new Error('Invalid review status');
            updates.ReviewStatus = data.reviewStatus;
        }
        if (data.reviewNotes !== undefined)
            updates.ReviewNotes = data.reviewNotes;
        // Always set ReviewedBy to the reviewerId
        updates.ReviewedBy = reviewerId;
        updates.ReviewedAt = new Date().toISOString();
        const { data: updatedVerification, error: updateError } = await supabase
            .from('AgentVerification')
            .update(updates)
            .eq('VerificationId', verificationId)
            .select()
            .single();
        if (updateError)
            throw new Error(updateError.message);
        // Update user's role and agent status based on verification review
        if (data.reviewStatus && data.reviewStatus !== 'PENDING') {
            if (data.reviewStatus === 'APPROVED') {
                await supabase
                    .from('Users')
                    .update({ Role: 'AGENT', AgentStatus: 'APPROVED', UpdatedAt: new Date().toISOString() })
                    .eq('UserId', verification.UserId);
            }
            else if (data.reviewStatus === 'REJECTED') {
                await supabase
                    .from('Users')
                    .update({ AgentStatus: 'REJECTED', UpdatedAt: new Date().toISOString() })
                    .eq('UserId', verification.UserId);
            }
        }
        return updatedVerification;
    }
    // Approve verification (convenience method)
    async approveVerification(verificationId, reviewerId, reviewNotes) {
        return this.updateVerification(verificationId, {
            reviewStatus: 'APPROVED',
            reviewNotes
        }, reviewerId);
    }
    // Reject verification (convenience method)
    async rejectVerification(verificationId, reviewerId, reviewNotes) {
        return this.updateVerification(verificationId, {
            reviewStatus: 'REJECTED',
            reviewNotes
        }, reviewerId);
    }
    // Get verification statistics
    async getVerificationStatistics() {
        try {
            const [{ count: total }, { count: pending }, { count: approved }, { count: rejected }, { count: last30Days }] = await Promise.all([
                supabase.from('AgentVerification').select('*', { count: 'exact', head: true }),
                supabase.from('AgentVerification').select('*', { count: 'exact', head: true }).eq('ReviewStatus', 'PENDING'),
                supabase.from('AgentVerification').select('*', { count: 'exact', head: true }).eq('ReviewStatus', 'APPROVED'),
                supabase.from('AgentVerification').select('*', { count: 'exact', head: true }).eq('ReviewStatus', 'REJECTED'),
                supabase.from('AgentVerification').select('*', { count: 'exact', head: true }).gt('SubmittedAt', new Date(Date.now() - 30 * 24 * 3600000).toISOString())
            ]);
            return {
                total: total || 0,
                pending: pending || 0,
                approved: approved || 0,
                rejected: rejected || 0,
                last30Days: last30Days || 0
            };
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    // Delete verification
    async deleteVerification(verificationId) {
        if (!ValidationUtils.isValidUUID(verificationId))
            throw new Error('Invalid verification ID format');
        // Get verification first to update user status
        const { data: verification, error: fetchError } = await supabase
            .from('AgentVerification')
            .select('UserId')
            .eq('VerificationId', verificationId)
            .single();
        if (fetchError || !verification)
            throw new Error('Verification not found');
        const { error: deleteError } = await supabase
            .from('AgentVerification')
            .delete()
            .eq('VerificationId', verificationId);
        if (!deleteError) {
            // Reset user's agent status to NONE
            await supabase
                .from('Users')
                .update({ AgentStatus: 'NONE', UpdatedAt: new Date().toISOString() })
                .eq('UserId', verification.UserId);
            return true;
        }
        return false;
    }
    // Bulk approve verifications
    async bulkApproveVerifications(verificationIds, reviewerId, reviewNotes) {
        if (!Array.isArray(verificationIds) || verificationIds.length === 0)
            throw new Error('No verification IDs provided');
        if (!ValidationUtils.isValidUUID(reviewerId))
            throw new Error('Invalid reviewer ID format');
        const results = [];
        for (const verificationId of verificationIds) {
            if (ValidationUtils.isValidUUID(verificationId)) {
                try {
                    const approved = await this.approveVerification(verificationId, reviewerId, reviewNotes);
                    if (approved)
                        results.push(approved);
                }
                catch (e) {
                    console.error(`Failed to approve ${verificationId}`, e);
                }
            }
        }
        return results;
    }
    // Bulk reject verifications
    async bulkRejectVerifications(verificationIds, reviewerId, reviewNotes) {
        if (!Array.isArray(verificationIds) || verificationIds.length === 0)
            throw new Error('No verification IDs provided');
        if (!ValidationUtils.isValidUUID(reviewerId))
            throw new Error('Invalid reviewer ID format');
        const results = [];
        for (const verificationId of verificationIds) {
            if (ValidationUtils.isValidUUID(verificationId)) {
                try {
                    const rejected = await this.rejectVerification(verificationId, reviewerId, reviewNotes);
                    if (rejected)
                        results.push(rejected);
                }
                catch (e) {
                    console.error(`Failed to reject ${verificationId}`, e);
                }
            }
        }
        return results;
    }
}
// Export singleton instance
export const agentVerificationService = new AgentVerificationService();
//# sourceMappingURL=agentService.js.map