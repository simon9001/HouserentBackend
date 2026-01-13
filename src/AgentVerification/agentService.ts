// agentService.ts
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
        console.log('Creating verification for user:', data.userId);
        
        try {
            // FIRST: Check if the user exists - try without quotes first
            const { data: userData, error: userError } = await supabase
                .from('Users')  // ✅ Try without quotes first
                .select('UserId, Username, FullName, Role, AgentStatus, IsActive, Email')
                .eq('UserId', data.userId)
                .single();

            console.log('User query result:', { userData, userError });

            // If that fails, try with lowercase
            if (userError && userError.code === 'PGRST205') {
                console.log('Trying lowercase users table...');
                
                const { data: userDataLower, error: userErrorLower } = await supabase
                    .from('users')  // ✅ Try lowercase
                    .select('user_id, username, full_name, role, agent_status, is_active, email')
                    .eq('user_id', data.userId)
                    .single();

                if (userErrorLower) {
                    console.error('Lowercase user query error:', userErrorLower);
                    throw new Error('User not found');
                }

                if (!userDataLower) {
                    throw new Error('User not found');
                }

                // Map lowercase fields to our expected format
                const mappedUserData = {
                    UserId: userDataLower.user_id,
                    Username: userDataLower.username,
                    FullName: userDataLower.full_name,
                    Role: userDataLower.role,
                    AgentStatus: userDataLower.agent_status,
                    IsActive: userDataLower.is_active,
                    Email: userDataLower.email
                };

                return await this.createVerificationWithUserData(data, mappedUserData);
            }

            if (userError) {
                console.error('User query error:', userError);
                if (userError.code === 'PGRST116') {
                    throw new Error('User not found');
                }
                throw new Error(`Database error: ${userError.message}`);
            }

            if (!userData) {
                throw new Error('User not found');
            }

            return await this.createVerificationWithUserData(data, userData);

        } catch (error: any) {
            console.error('Error in createVerification:', error);
            throw error;
        }
    }

    private async createVerificationWithUserData(data: CreateVerificationInput, userData: any): Promise<AgentVerification> {
        console.log('Found user:', userData);

        // Check if user is active
        if (!userData.IsActive && !userData.is_active) {
            throw new Error('User account is not active');
        }

        const userRole = (userData.Role || userData.role)?.toUpperCase();
        const agentStatus = (userData.AgentStatus || userData.agent_status)?.toUpperCase();

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
            .from('agent_verification')
            .select('verification_id')
            .eq('user_id', data.userId)
            .in('review_status', ['PENDING', 'APPROVED']);

        if (existingError) {
            console.error('Existing verification query error:', existingError);
        }

        console.log('Existing verifications:', existing);

        if (existing && existing.length > 0) {
            throw new Error('Agent verification already exists or is pending');
        }

        // Create verification
        const verificationData = {
            user_id: data.userId,
            national_id: data.nationalId,
            selfie_url: data.selfieUrl,
            id_front_url: data.idFrontUrl,
            id_back_url: data.idBackUrl || null,
            property_proof_url: data.propertyProofUrl || null,
            review_status: 'PENDING'
        };

        console.log('Creating verification with data:', verificationData);

        const { data: newVerification, error: createError } = await supabase
            .from('agent_verification')
            .insert(verificationData)
            .select()
            .single();

        if (createError) {
            console.error('Create verification error:', createError);
            throw new Error(`Failed to create verification: ${createError.message}`);
        }

        console.log('Verification created:', newVerification);

        // Update user's agent status to PENDING
        try {
            // Try to update Users table (PascalCase)
            const { error: updateError } = await supabase
                .from('Users')
                .update({ 
                    AgentStatus: 'PENDING',
                    UpdatedAt: new Date().toISOString()
                })
                .eq('UserId', data.userId);

            if (updateError) {
                console.log('Trying lowercase users table for update...');
                // Try lowercase table
                await supabase
                    .from('users')
                    .update({ 
                        agent_status: 'PENDING',
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', data.userId);
            }

            console.log('User updated successfully');
        } catch (updateError: any) {
            console.error('Update user error (non-critical):', updateError);
            // Don't throw here, verification was created successfully
        }

        return this.mapToCamelCase(newVerification) as AgentVerification;
    }

    // Get verification by ID - FIXED VERSION
    async getVerificationById(verificationId: string): Promise<AgentVerification | null> {
        console.log('Getting verification by ID:', verificationId);
        
        if (!ValidationUtils.isValidUUID(verificationId)) {
            console.error('Invalid verification ID format:', verificationId);
            throw new Error('Invalid verification ID format');
        }

        try {
            console.log('Attempting to fetch verification from agent_verification table...');
            
            // Try simple query without joins first
            const { data, error } = await supabase
                .from('agent_verification')
                .select('*')
                .eq('verification_id', verificationId)
                .single();

            console.log('Query result:', { data, error });

            if (error) {
                console.error('Get verification by ID error:', error);
                if (error.code === 'PGRST116') {
                    console.log('Verification not found');
                    return null;
                }
                throw new Error(error.message);
            }

            if (!data) {
                console.log('No verification found');
                return null;
            }

            // Get user details separately
            const userData = await this.getUserDetails(data.user_id);
            const reviewerData = data.reviewed_by ? await this.getUserDetails(data.reviewed_by) : null;
            
            const result = this.mapToCamelCase(data) as any;
            if (userData) {
                result.UserFullName = userData.FullName || userData.full_name;
                result.UserEmail = userData.Email || userData.email;
                result.UserPhoneNumber = userData.PhoneNumber || userData.phone_number;
                result.UserRole = userData.Role || userData.role;
                result.UserAgentStatus = userData.AgentStatus || userData.agent_status;
            }

            if (reviewerData) {
                result.ReviewerFullName = reviewerData.FullName || reviewerData.full_name;
            }

            console.log('Returning verification:', result);
            return result as AgentVerification;
            
        } catch (error: any) {
            console.error('Error in getVerificationById:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    // Get verification by user ID
    async getVerificationByUserId(userId: string): Promise<AgentVerification | null> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

        try {
            const { data, error } = await supabase
                .from('agent_verification')
                .select('*')
                .eq('user_id', userId)
                .order('submitted_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                console.error('Get verification by user ID error:', error);
                throw new Error(error.message);
            }

            // Get user details separately
            const userData = await this.getUserDetails(userId);
            
            const result = this.mapToCamelCase(data) as any;
            if (userData) {
                result.UserFullName = userData.FullName || userData.full_name;
                result.UserEmail = userData.Email || userData.email;
                result.UserPhoneNumber = userData.PhoneNumber || userData.phone_number;
                result.UserRole = userData.Role || userData.role;
                result.UserAgentStatus = userData.AgentStatus || userData.agent_status;
            }

            return result as AgentVerification;
        } catch (error: any) {
            console.error('Error in getVerificationByUserId:', error);
            throw error;
        }
    }

    // Helper method to get user details
    private async getUserDetails(userId: string): Promise<any> {
        try {
            // Try Users table first
            const { data: userData, error: userError } = await supabase
                .from('Users')
                .select('UserId, FullName, Email, PhoneNumber, Role, AgentStatus')
                .eq('UserId', userId)
                .single();

            if (!userError) return userData;

            // Try lowercase users table
            const { data: userDataLower, error: userErrorLower } = await supabase
                .from('users')
                .select('user_id, full_name, email, phone_number, role, agent_status')
                .eq('user_id', userId)
                .single();

            if (!userErrorLower) return userDataLower;

            return null;
        } catch (error) {
            console.error('Error getting user details:', error);
            return null;
        }
    }

    // Get all verifications with pagination
    async getAllVerifications(
        page: number = 1,
        limit: number = 20,
        status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    ): Promise<{ verifications: AgentVerification[]; total: number; page: number; totalPages: number }> {
        const offset = (page - 1) * limit;

        try {
            let query = supabase
                .from('agent_verification')
                .select('*', { count: 'exact' });

            if (status) {
                query = query.eq('review_status', status);
            }

            const { data, count, error } = await query
                .order('submitted_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) {
                console.error('Get all verifications error:', error);
                throw new Error(error.message);
            }

            // Get user details for each verification
            const verifications = await Promise.all(
                (data || []).map(async (verification: any) => {
                    const result = this.mapToCamelCase(verification) as any;
                    
                    // Get user details
                    const userData = await this.getUserDetails(verification.user_id);
                    if (userData) {
                        result.UserFullName = userData.FullName || userData.full_name;
                        result.UserEmail = userData.Email || userData.email;
                        result.UserPhoneNumber = userData.PhoneNumber || userData.phone_number;
                        result.UserRole = userData.Role || userData.role;
                        result.UserAgentStatus = userData.AgentStatus || userData.agent_status;
                    }

                    // Get reviewer details if exists
                    if (verification.reviewed_by) {
                        const reviewerData = await this.getUserDetails(verification.reviewed_by);
                        if (reviewerData) {
                            result.ReviewerFullName = reviewerData.FullName || reviewerData.full_name;
                        }
                    }

                    return result as AgentVerification;
                })
            );

            return {
                verifications,
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit)
            };
        } catch (error: any) {
            console.error('Error in getAllVerifications:', error);
            throw error;
        }
    }

    // Helper method to map snake_case to camelCase
    private mapToCamelCase(data: any): any {
        if (!data) return data;
        
        const result: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                // Convert snake_case to camelCase
                const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                result[camelKey] = data[key];
            }
        }
        return result;
    }

    // Update verification (admin review)
    async updateVerification(
        verificationId: string,
        data: UpdateVerificationInput,
        reviewerId: string
    ): Promise<AgentVerification | null> {
        if (!ValidationUtils.isValidUUID(verificationId)) throw new Error('Invalid verification ID format');
        if (!ValidationUtils.isValidUUID(reviewerId)) throw new Error('Invalid reviewer ID format');

        try {
            // Check if verification exists
            const { data: verification, error: fetchError } = await supabase
                .from('agent_verification')
                .select('*')
                .eq('verification_id', verificationId)
                .single();

            if (fetchError || !verification) {
                console.error('Verification not found:', fetchError);
                throw new Error('Verification not found');
            }

            const updates: any = {};
            if (data.reviewStatus) {
                const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
                if (!validStatuses.includes(data.reviewStatus)) throw new Error('Invalid review status');
                updates.review_status = data.reviewStatus;
            }

            if (data.reviewNotes !== undefined) updates.review_notes = data.reviewNotes;

            // Always set reviewed_by to the reviewerId
            updates.reviewed_by = reviewerId;
            updates.reviewed_at = new Date().toISOString();

            const { data: updatedVerification, error: updateError } = await supabase
                .from('agent_verification')
                .update(updates)
                .eq('verification_id', verificationId)
                .select()
                .single();

            if (updateError) {
                console.error('Update verification error:', updateError);
                throw new Error(updateError.message);
            }

            // Update user's role and agent status based on verification review
            if (data.reviewStatus && data.reviewStatus !== 'PENDING') {
                const userId = verification.user_id;
                
                try {
                    // Try to update Users table
                    await supabase
                        .from('Users')
                        .update({ 
                            Role: data.reviewStatus === 'APPROVED' ? 'AGENT' : undefined,
                            AgentStatus: data.reviewStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED',
                            UpdatedAt: new Date().toISOString()
                        })
                        .eq('UserId', userId);
                } catch (error) {
                    // Try lowercase users table
                    await supabase
                        .from('users')
                        .update({ 
                            role: data.reviewStatus === 'APPROVED' ? 'AGENT' : undefined,
                            agent_status: data.reviewStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED',
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', userId);
                }
            }

            return this.mapToCamelCase(updatedVerification) as AgentVerification;
        } catch (error: any) {
            console.error('Error in updateVerification:', error);
            throw error;
        }
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

    // =============================================
    // NEW METHODS NEEDED BY CONTROLLER
    // =============================================

    // Bulk approve verifications
    async bulkApproveVerifications(
        verificationIds: string[],
        reviewerId: string,
        reviewNotes?: string
    ): Promise<AgentVerification[]> {
        console.log('Bulk approving verifications:', verificationIds);
        
        const results: AgentVerification[] = [];
        
        try {
            // Process each verification
            for (const verificationId of verificationIds) {
                try {
                    const approved = await this.approveVerification(
                        verificationId,
                        reviewerId,
                        reviewNotes
                    );
                    
                    if (approved) {
                        results.push(approved);
                    }
                } catch (error) {
                    console.error(`Error approving verification ${verificationId}:`, error);
                    // Continue with other verifications
                }
            }
            
            return results;
        } catch (error: any) {
            console.error('Error in bulkApproveVerifications:', error);
            throw new Error('Failed to bulk approve verifications');
        }
    }

    // Bulk reject verifications
    async bulkRejectVerifications(
        verificationIds: string[],
        reviewerId: string,
        reviewNotes?: string
    ): Promise<AgentVerification[]> {
        console.log('Bulk rejecting verifications:', verificationIds);
        
        const results: AgentVerification[] = [];
        
        try {
            // Process each verification
            for (const verificationId of verificationIds) {
                try {
                    const rejected = await this.rejectVerification(
                        verificationId,
                        reviewerId,
                        reviewNotes
                    );
                    
                    if (rejected) {
                        results.push(rejected);
                    }
                } catch (error) {
                    console.error(`Error rejecting verification ${verificationId}:`, error);
                    // Continue with other verifications
                }
            }
            
            return results;
        } catch (error: any) {
            console.error('Error in bulkRejectVerifications:', error);
            throw new Error('Failed to bulk reject verifications');
        }
    }

    // Check user eligibility to apply
    async checkEligibility(userId: string): Promise<{
        canApply: boolean;
        reason: string;
        currentStatus: {
            role: string;
            agentStatus: string;
            hasVerification: boolean;
            verificationStatus?: string;
        };
    }> {
        console.log('Checking eligibility for user:', userId);
        
        try {
            // Get user details
            const userData = await this.getUserDetails(userId);
            
            if (!userData) {
                throw new Error('User not found');
            }

            const role = userData.Role || userData.role;
            const agentStatus = userData.AgentStatus || userData.agent_status;

            // Check if user already has a verification
            const verification = await this.getVerificationByUserId(userId);
            
            // Determine eligibility
            let canApply = true;
            let reason = '';

            if (role === 'ADMIN') {
                canApply = false;
                reason = 'Administrators cannot apply to become agents';
            } else if (agentStatus === 'APPROVED') {
                canApply = false;
                reason = 'You are already an approved agent';
            } else if (verification?.ReviewStatus === 'PENDING') {
                canApply = false;
                reason = 'You already have a pending verification';
            } else if (verification?.ReviewStatus === 'APPROVED') {
                canApply = false;
                reason = 'You already have an approved verification';
            } else {
                reason = 'You are eligible to apply';
            }

            return {
                canApply,
                reason,
                currentStatus: {
                    role,
                    agentStatus,
                    hasVerification: !!verification,
                    verificationStatus: verification?.ReviewStatus
                }
            };
        } catch (error: any) {
            console.error('Error checking eligibility:', error);
            throw new Error('Failed to check eligibility');
        }
    }

    // Admin creates verification for a user (alias)
    async createVerificationForUser(data: CreateVerificationInput): Promise<AgentVerification> {
        return this.createVerification(data);
    }

    // Get verification statistics (same as getStatusCounts)
    async getStatusCounts(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        last30Days: number;
    }> {
        return this.getVerificationStatistics();
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
                supabase.from('agent_verification').select('*', { count: 'exact', head: true }),
                supabase.from('agent_verification').select('*', { count: 'exact', head: true }).eq('review_status', 'PENDING'),
                supabase.from('agent_verification').select('*', { count: 'exact', head: true }).eq('review_status', 'APPROVED'),
                supabase.from('agent_verification').select('*', { count: 'exact', head: true }).eq('review_status', 'REJECTED'),
                supabase.from('agent_verification').select('*', { count: 'exact', head: true }).gt('submitted_at', new Date(Date.now() - 30 * 24 * 3600000).toISOString())
            ]);

            return {
                total: total || 0,
                pending: pending || 0,
                approved: approved || 0,
                rejected: rejected || 0,
                last30Days: last30Days || 0
            };
        } catch (error: any) {
            console.error('Error in getVerificationStatistics:', error);
            throw new Error(error.message);
        }
    }

    // Delete verification
    async deleteVerification(verificationId: string): Promise<boolean> {
        if (!ValidationUtils.isValidUUID(verificationId)) throw new Error('Invalid verification ID format');

        try {
            // Get verification first to get user ID
            const { data: verification, error: fetchError } = await supabase
                .from('agent_verification')
                .select('user_id')
                .eq('verification_id', verificationId)
                .single();

            if (fetchError || !verification) throw new Error('Verification not found');

            // Delete the verification
            const { error: deleteError } = await supabase
                .from('agent_verification')
                .delete()
                .eq('verification_id', verificationId);

            if (deleteError) throw new Error(deleteError.message);

            // Reset user's agent status
            try {
                await supabase
                    .from('Users')
                    .update({ 
                        AgentStatus: 'NONE',
                        UpdatedAt: new Date().toISOString()
                    })
                    .eq('UserId', verification.user_id);
            } catch (error) {
                // Try lowercase
                await supabase
                    .from('users')
                    .update({ 
                        agent_status: 'NONE',
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', verification.user_id);
            }

            return true;
        } catch (error: any) {
            console.error('Error in deleteVerification:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const agentVerificationService = new AgentVerificationService();