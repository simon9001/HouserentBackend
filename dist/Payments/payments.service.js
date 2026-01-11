import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';
export class PaymentsService {
    // Create new payment
    async createPayment(data) {
        // Validate amount
        if (data.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        // Validate user exists
        const { data: user, error: userError } = await supabase
            .from('Users')
            .select('UserId')
            .eq('UserId', data.userId)
            .eq('IsActive', true)
            .single();
        if (userError || !user) {
            throw new Error('User not found or inactive');
        }
        // Validate property exists if provided
        if (data.propertyId) {
            const { data: prop, error: propError } = await supabase
                .from('Properties')
                .select('PropertyId')
                .eq('PropertyId', data.propertyId)
                .single();
            if (propError || !prop) {
                throw new Error('Property not found');
            }
        }
        // Check for duplicate provider reference
        const { data: duplicate } = await supabase
            .from('Payments')
            .select('PaymentId')
            .eq('ProviderReference', data.providerReference)
            .single();
        if (duplicate) {
            throw new Error('Duplicate provider reference');
        }
        const { data: newPayment, error } = await supabase
            .from('Payments')
            .insert({
            UserId: data.userId,
            PropertyId: data.propertyId || null,
            Amount: data.amount,
            Currency: data.currency || 'KES',
            PaymentProvider: data.paymentProvider,
            ProviderReference: data.providerReference,
            Purpose: data.purpose,
            Status: 'PENDING'
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return newPayment;
    }
    // Get payment by ID
    async getPaymentById(paymentId) {
        if (!ValidationUtils.isValidUUID(paymentId))
            throw new Error('Invalid payment ID format');
        const { data, error } = await supabase
            .from('Payments')
            .select(`
                *,
                Users:UserId (FullName),
                Properties:PropertyId (Title)
            `)
            .eq('PaymentId', paymentId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        const result = { ...data };
        if (data.Users) {
            result.UserName = data.Users.FullName;
            delete result.Users;
        }
        if (data.Properties) {
            result.PropertyTitle = data.Properties.Title;
            delete result.Properties;
        }
        return result;
    }
    // Get payments by user ID
    async getPaymentsByUserId(userId, status) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        let query = supabase
            .from('Payments')
            .select(`
                *,
                Properties:PropertyId (Title)
            `)
            .eq('UserId', userId)
            .order('CreatedAt', { ascending: false });
        if (status) {
            query = query.eq('Status', status);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data.map((p) => {
            const res = { ...p };
            if (p.Properties) {
                res.PropertyTitle = p.Properties.Title;
                delete p.Properties;
            }
            return res;
        });
    }
    // Get payments by property ID
    async getPaymentsByPropertyId(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { data, error } = await supabase
            .from('Payments')
            .select(`
                *,
                Users:UserId (FullName)
            `)
            .eq('PropertyId', propertyId)
            .order('CreatedAt', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map((p) => {
            const res = { ...p };
            if (p.Users) {
                res.UserName = p.Users.FullName;
                delete p.Users;
            }
            return res;
        });
    }
    // Update payment status
    async updatePayment(paymentId, data) {
        if (!ValidationUtils.isValidUUID(paymentId))
            throw new Error('Invalid payment ID format');
        // Get current payment
        const currentPayment = await this.getPaymentById(paymentId);
        if (!currentPayment) {
            throw new Error('Payment not found');
        }
        const updates = {};
        if (data.status !== undefined) {
            updates.Status = data.status;
            if (data.status === 'COMPLETED') {
                updates.CompletedAt = new Date().toISOString(); // SYSDATETIME equivalent
            }
            else if (currentPayment.Status === 'COMPLETED' && data.status !== 'COMPLETED') {
                updates.CompletedAt = null;
            }
        }
        if (data.providerReference !== undefined) {
            updates.ProviderReference = data.providerReference;
        }
        if (data.completedAt !== undefined) {
            updates.CompletedAt = data.completedAt.toISOString();
        }
        if (Object.keys(updates).length === 0) {
            throw new Error('No fields to update');
        }
        const { data: updatedPayment, error } = await supabase
            .from('Payments')
            .update(updates)
            .eq('PaymentId', paymentId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        // Handle payment completion logic
        if (data.status === 'COMPLETED') {
            await this.handlePaymentCompletion(updatedPayment);
        }
        return updatedPayment;
    }
    // Complete payment
    async completePayment(paymentId) {
        return this.updatePayment(paymentId, { status: 'COMPLETED' });
    }
    // Fail payment
    async failPayment(paymentId, _reason) {
        return this.updatePayment(paymentId, { status: 'FAILED' });
    }
    // Refund payment
    async refundPayment(paymentId) {
        return this.updatePayment(paymentId, { status: 'REFUNDED' });
    }
    // Get payment statistics
    async getPaymentStatistics(userId, startDate, endDate) {
        // Fetch relevant payments to aggregate
        // Note: For large datasets, use RPC. For migration compatibility, we aggregate in JS.
        let query = supabase.from('Payments').select('Amount, Status, CreatedAt');
        if (userId)
            query = query.eq('UserId', userId);
        if (startDate)
            query = query.gte('CreatedAt', startDate.toISOString());
        if (endDate)
            query = query.lte('CreatedAt', endDate.toISOString());
        const { data: payments, error } = await query;
        if (error)
            throw new Error(error.message);
        const stats = {
            totalAmount: 0,
            completedAmount: 0,
            pendingAmount: 0,
            failedAmount: 0,
            refundedAmount: 0,
            totalTransactions: 0,
            completedTransactions: 0,
            pendingTransactions: 0,
            failedTransactions: 0,
            refundedTransactions: 0,
            recentTransactions: 0
        };
        if (payments) {
            stats.totalTransactions = payments.length;
            payments.forEach((p) => {
                const amount = Number(p.Amount) || 0;
                stats.totalAmount += amount;
                switch (p.Status) {
                    case 'COMPLETED':
                        stats.completedAmount += amount;
                        stats.completedTransactions++;
                        break;
                    case 'PENDING':
                        stats.pendingAmount += amount;
                        stats.pendingTransactions++;
                        break;
                    case 'FAILED':
                        stats.failedAmount += amount;
                        stats.failedTransactions++;
                        break;
                    case 'REFUNDED':
                        stats.refundedAmount += amount;
                        stats.refundedTransactions++;
                        break;
                }
            });
        }
        return stats;
    }
    // Get recent payments
    async getRecentPayments(limit = 10) {
        const { data, error } = await supabase
            .from('Payments')
            .select(`
                *,
                Users:UserId (FullName),
                Properties:PropertyId (Title)
            `)
            .order('CreatedAt', { ascending: false })
            .limit(limit);
        if (error)
            throw new Error(error.message);
        return data.map((p) => {
            const res = { ...p };
            if (p.Users)
                res.UserName = p.Users.FullName;
            if (p.Properties)
                res.PropertyTitle = p.Properties.Title;
            delete p.Users;
            delete p.Properties;
            return res;
        });
    }
    // Search payments
    async searchPayments(searchTerm, userId) {
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new Error('Search term must be at least 2 characters');
        }
        // Search logic: ProviderReference OR User FullName OR Property Title
        // Note: Cross-table OR search in Supabase is complex. 
        // We can search ProviderReference primarily, or try to filter if we fetch more.
        let query = supabase
            .from('Payments')
            .select(`
                *,
                Users:UserId (FullName),
                Properties:PropertyId (Title)
            `);
        // Construct filter
        // We will filter first by explicit UserID if present
        if (userId) {
            query = query.eq('UserId', userId);
        }
        // Apply search
        // We can use .or() for local columns. Searching foreign columns 'Users.FullName' via .or() is not standard.
        // We will search ProviderReference here, and maybe rely on client filtering for Name/Title if needed?
        // Or we use 'textSearch' if configured. 
        // Original MSSQL was: ProviderReference LIKE OR UserName LIKE OR Title LIKE.
        // We'll prioritize ProviderReference search for now as it's the main ID. 
        // We can also try `.ilike('ProviderReference', \`%\${searchTerm}%\`)`
        query = query.ilike('ProviderReference', `%${searchTerm}%`);
        const { data, error } = await query.order('CreatedAt', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map((p) => {
            const res = { ...p };
            if (p.Users)
                res.UserName = p.Users.FullName;
            if (p.Properties)
                res.PropertyTitle = p.Properties.Title;
            delete p.Users;
            delete p.Properties;
            return res;
        });
    }
    // Helper method to handle payment completion logic
    async handlePaymentCompletion(payment) {
        switch (payment.Purpose) {
            case 'BOOST':
                // Boost the property
                if (payment.PropertyId) {
                    const boostDays = 30;
                    const expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + boostDays);
                    await supabase
                        .from('Properties')
                        .update({
                        IsBoosted: true,
                        BoostExpiry: expirationDate.toISOString()
                    })
                        .eq('PropertyId', payment.PropertyId);
                }
                break;
            case 'ACCESS':
                // Placeholder: Add premium access logic
                break;
            case 'BOOKING':
                // Placeholder: Confirm booking logic
                break;
            case 'DEPOSIT':
                // Placeholder: Record deposit logic
                break;
            case 'SUBSCRIPTION':
                // Placeholder: Update subscription logic
                break;
        }
    }
}
export const paymentsService = new PaymentsService();
//# sourceMappingURL=payments.service.js.map