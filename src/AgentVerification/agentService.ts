import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface AgentVerification {
    VerificationId: string;
    UserId: string;
    NationalId: string;
    SelfieUrl: string;
    IdFrontUrl: string;
    IdBackUrl: string | null;
    PropertyProofUrl: string | null;
    ReviewedBy: string | null;
    ReviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    ReviewNotes: string | null;
    SubmittedAt: Date;
    ReviewedAt: Date | null;

    // Expanded fields
    UserFullName?: string;
    UserEmail?: string;
    UserPhoneNumber?: string;
    UserRole?: string;
    UserAgentStatus?: string;
    ReviewerFullName?: string;
}

export interface CreateVerificationInput {
    userId: string;
    nationalId: string;
    selfieUrl: string;
    idFrontUrl: string;
    idBackUrl?: string;
    propertyProofUrl?: string;
}

export interface UpdateVerificationInput {
    reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewNotes?: string;
    reviewedBy?: string;
}

export class AgentVerificationService {

    // Create new agent verification
    async createVerification(data: CreateVerificationInput): Promise<AgentVerification> {
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

        if (createError) throw new Error(createError.message);

        // Update user's agent status to PENDING
        await supabase
            .from('Users')
            .update({ AgentStatus: 'PENDING', UpdatedAt: new Date().toISOString() })
            .eq('UserId', data.userId);

        return newVerification as AgentVerification;
    }

    // Create verification by admin for a user
    async createVerificationForUser(data: CreateVerificationInput): Promise<AgentVerification> {
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

        if (createError) throw new Error(createError.message);

        // Update user's agent status to PENDING
        await supabase
            .from('Users')
            .update({ AgentStatus: 'PENDING', UpdatedAt: new Date().toISOString() })
            .eq('UserId', data.userId);

        return newVerification as AgentVerification;
    }

    // Get verification by ID
    async getVerificationById(verificationId: string): Promise<AgentVerification | null> {
        if (!ValidationUtils.isValidUUID(verificationId)) throw new Error('Invalid verification ID format');

        const { data, error } = await supabase
            .from('AgentVerification')
            .select(`
                *,
                Users:UserId (FullName, Email, PhoneNumber, Role, AgentStatus)
            `)
            .eq('VerificationId', verificationId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        // Transform to flat structure to match interface if needed
        const result: any = { ...data };
        if (data.Users) {
            result.UserFullName = data.Users.FullName;
            result.UserEmail = data.Users.Email;
            result.UserPhoneNumber = data.Users.PhoneNumber;
            result.UserRole = data.Users.Role;
            result.UserAgentStatus = data.Users.AgentStatus;
            delete result.Users; // Remove nested object
        }

        return result as AgentVerification;
    }

    // Get verification by user ID
    async getVerificationByUserId(userId: string): Promise<AgentVerification | null> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

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
            if (error.code === 'PGRST116') return null;
            throw new Error(error.message);
        }

        const result: any = { ...data };
        if (data.Users) {
            result.UserFullName = data.Users.FullName;
            result.UserEmail = data.Users.Email;
            result.UserPhoneNumber = data.Users.PhoneNumber;
            result.UserRole = data.Users.Role;
            result.UserAgentStatus = data.Users.AgentStatus;
            delete result.Users;
        }

        return result as AgentVerification;
    }

    // Get all verifications with pagination
    async getAllVerifications(
        page: number = 1,
        limit: number = 20,
        status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    ): Promise<{ verifications: AgentVerification[]; total: number; page: number; totalPages: number }> {
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

        if (error) throw new Error(error.message);

        const verifications = data?.map((v: any) => {
            const result: any = { ...v };
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
            verifications: verifications as AgentVerification[],
            total: count || 0,
            page,
            totalPages: Math.ceil((count || 0) / limit)
        };
    }

    // Update verification (admin review)
    async updateVerification(
        verificationId: string,
        data: UpdateVerificationInput,
        reviewerId: string
    ): Promise<AgentVerification | null> {
        if (!ValidationUtils.isValidUUID(verificationId)) throw new Error('Invalid verification ID format');
        if (!ValidationUtils.isValidUUID(reviewerId)) throw new Error('Invalid reviewer ID format');

        // Check if verification exists
        const { data: verification, error: fetchError } = await supabase
            .from('AgentVerification')
            .select('*')
            .eq('VerificationId', verificationId)
            .single();

        if (fetchError || !verification) throw new Error('Verification not found');

        const updates: any = {};
        if (data.reviewStatus) {
            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
            if (!validStatuses.includes(data.reviewStatus)) throw new Error('Invalid review status');
            updates.ReviewStatus = data.reviewStatus;
        }

        if (data.reviewNotes !== undefined) updates.ReviewNotes = data.reviewNotes;

        // Always set ReviewedBy to the reviewerId
        updates.ReviewedBy = reviewerId;
        updates.ReviewedAt = new Date().toISOString();

        const { data: updatedVerification, error: updateError } = await supabase
            .from('AgentVerification')
            .update(updates)
            .eq('VerificationId', verificationId)
            .select()
            .single();

        if (updateError) throw new Error(updateError.message);

        // Update user's role and agent status based on verification review
        if (data.reviewStatus && data.reviewStatus !== 'PENDING') {
            if (data.reviewStatus === 'APPROVED') {
                await supabase
                    .from('Users')
                    .update({ Role: 'AGENT', AgentStatus: 'APPROVED', UpdatedAt: new Date().toISOString() })
                    .eq('UserId', verification.UserId);
            } else if (data.reviewStatus === 'REJECTED') {
                await supabase
                    .from('Users')
                    .update({ AgentStatus: 'REJECTED', UpdatedAt: new Date().toISOString() })
                    .eq('UserId', verification.UserId);
            }
        }

        return updatedVerification as AgentVerification;
    }

    // Approve verification (convenience method)
    async approveVerification(
        verificationId: string,
        reviewerId: string,
        reviewNotes?: string
    ): Promise<AgentVerification | null> {
        return this.updateVerification(verificationId, {
            reviewStatus: 'APPROVED',
            reviewNotes
        }, reviewerId);
    }

    // Reject verification (convenience method)
    async rejectVerification(
        verificationId: string,
        reviewerId: string,
        reviewNotes?: string
    ): Promise<AgentVerification | null> {
        return this.updateVerification(verificationId, {
            reviewStatus: 'REJECTED',
            reviewNotes
        }, reviewerId);
    }

    // Get verification statistics
    async getVerificationStatistics(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        last30Days: number;
    }> {
        try {
            const [
                { count: total },
                { count: pending },
                { count: approved },
                { count: rejected },
                { count: last30Days }
            ] = await Promise.all([
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
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    // Delete verification
    async deleteVerification(verificationId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(verificationId)) throw new Error('Invalid verification ID format');

        // Get verification first to update user status
        const { data: verification, error: fetchError } = await supabase
            .from('AgentVerification')
            .select('UserId')
            .eq('VerificationId', verificationId)
            .single();

        if (fetchError || !verification) throw new Error('Verification not found');

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
    async bulkApproveVerifications(
        verificationIds: string[],
        reviewerId: string,
        reviewNotes?: string
    ): Promise<AgentVerification[]> {

        if (!Array.isArray(verificationIds) || verificationIds.length === 0) throw new Error('No verification IDs provided');
        if (!ValidationUtils.isValidUUID(reviewerId)) throw new Error('Invalid reviewer ID format');

        const results: AgentVerification[] = [];
        for (const verificationId of verificationIds) {
            if (ValidationUtils.isValidUUID(verificationId)) {
                try {
                    const approved = await this.approveVerification(verificationId, reviewerId, reviewNotes);
                    if (approved) results.push(approved);
                } catch (e) {
                    console.error(`Failed to approve ${verificationId}`, e);
                }
            }
        }
        return results;
    }

    // Bulk reject verifications
    async bulkRejectVerifications(
        verificationIds: string[],
        reviewerId: string,
        reviewNotes?: string
    ): Promise<AgentVerification[]> {

        if (!Array.isArray(verificationIds) || verificationIds.length === 0) throw new Error('No verification IDs provided');
        if (!ValidationUtils.isValidUUID(reviewerId)) throw new Error('Invalid reviewer ID format');

        const results: AgentVerification[] = [];
        for (const verificationId of verificationIds) {
            if (ValidationUtils.isValidUUID(verificationId)) {
                try {
                    const rejected = await this.rejectVerification(verificationId, reviewerId, reviewNotes);
                    if (rejected) results.push(rejected);
                } catch (e) {
                    console.error(`Failed to reject ${verificationId}`, e);
                }
            }
        }
        return results;
    }
}

// Export singleton instance
export const agentVerificationService = new AgentVerificationService();
