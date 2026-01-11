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
            .from('users')
            .select('user_id')
            .eq('user_id', data.userId)
            .eq('is_active', true)
            .single();
        if (userError || !user) {
            throw new Error('User not found or inactive');
        }
        // Validate property exists if provided
        if (data.propertyId) {
            const { data: prop, error: propError } = await supabase
                .from('properties')
                .select('property_id')
                .eq('property_id', data.propertyId)
                .single();
            if (propError || !prop) {
                throw new Error('Property not found');
            }
        }
        // Check for duplicate provider reference
        const { data: duplicate } = await supabase
            .from('payments')
            .select('payment_id')
            .eq('provider_reference', data.providerReference)
            .single();
        if (duplicate) {
            throw new Error('Duplicate provider reference');
        }
        const now = new Date().toISOString();
        const { data: newPayment, error } = await supabase
            .from('payments')
            .insert({
            user_id: data.userId,
            property_id: data.propertyId || null,
            amount: data.amount,
            currency: data.currency || 'KES',
            payment_provider: data.paymentProvider,
            provider_reference: data.providerReference,
            purpose: data.purpose,
            status: 'PENDING',
            created_at: now
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
            .from('payments')
            .select(`
                *,
                users:user_id (full_name),
                properties:property_id (title)
            `)
            .eq('payment_id', paymentId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(error.message);
        }
        const result = { ...data };
        if (data.users) {
            result.user_name = data.users.full_name;
            delete result.users;
        }
        if (data.properties) {
            result.property_title = data.properties.title;
            delete result.properties;
        }
        return result;
    }
    // Get payments by user ID
    async getPaymentsByUserId(userId, status) {
        if (!ValidationUtils.isValidUUID(userId))
            throw new Error('Invalid user ID format');
        let query = supabase
            .from('payments')
            .select(`
                *,
                properties:property_id (title)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data.map((p) => {
            const res = { ...p };
            if (p.properties) {
                res.property_title = p.properties.title;
                delete res.properties;
            }
            return res;
        });
    }
    // Get payments by property ID
    async getPaymentsByPropertyId(propertyId) {
        if (!ValidationUtils.isValidUUID(propertyId))
            throw new Error('Invalid property ID format');
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                users:user_id (full_name)
            `)
            .eq('property_id', propertyId)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map((p) => {
            const res = { ...p };
            if (p.users) {
                res.user_name = p.users.full_name;
                delete res.users;
            }
            return res;
        });
    }
    // Update payment status - FIXED
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
            updates.status = data.status;
            if (data.status === 'COMPLETED') {
                updates.completed_at = new Date().toISOString();
            }
            else if (currentPayment.status === 'COMPLETED') {
                // If current status is COMPLETED and new status is not COMPLETED, clear completed_at
                updates.completed_at = null;
            }
        }
        if (data.providerReference !== undefined) {
            updates.provider_reference = data.providerReference;
        }
        if (data.completedAt !== undefined) {
            updates.completed_at = data.completedAt.toISOString();
        }
        if (Object.keys(updates).length === 0) {
            throw new Error('No fields to update');
        }
        const { data: updatedPayment, error } = await supabase
            .from('payments')
            .update(updates)
            .eq('payment_id', paymentId)
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
        let query = supabase.from('payments').select('amount, status, created_at');
        if (userId)
            query = query.eq('user_id', userId);
        if (startDate)
            query = query.gte('created_at', startDate.toISOString());
        if (endDate)
            query = query.lte('created_at', endDate.toISOString());
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
            refundedTransactions: 0
        };
        if (payments) {
            stats.totalTransactions = payments.length;
            payments.forEach((p) => {
                const amount = Number(p.amount) || 0;
                stats.totalAmount += amount;
                switch (p.status) {
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
            .from('payments')
            .select(`
                *,
                users:user_id (full_name),
                properties:property_id (title)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error)
            throw new Error(error.message);
        return data.map((p) => {
            const res = { ...p };
            if (p.users)
                res.user_name = p.users.full_name;
            if (p.properties)
                res.property_title = p.properties.title;
            delete res.users;
            delete res.properties;
            return res;
        });
    }
    // Search payments
    async searchPayments(searchTerm, userId) {
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new Error('Search term must be at least 2 characters');
        }
        let query = supabase
            .from('payments')
            .select(`
                *,
                users:user_id (full_name),
                properties:property_id (title)
            `);
        if (userId) {
            query = query.eq('user_id', userId);
        }
        query = query.ilike('provider_reference', `%${searchTerm}%`);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data.map((p) => {
            const res = { ...p };
            if (p.users)
                res.user_name = p.users.full_name;
            if (p.properties)
                res.property_title = p.properties.title;
            delete res.users;
            delete res.properties;
            return res;
        });
    }
    // Get payments by purpose
    async getPaymentsByPurpose(purpose, status) {
        let query = supabase
            .from('payments')
            .select(`
                *,
                users:user_id (full_name),
                properties:property_id (title)
            `)
            .eq('purpose', purpose)
            .order('created_at', { ascending: false });
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data.map((p) => {
            const res = { ...p };
            if (p.users)
                res.user_name = p.users.full_name;
            if (p.properties)
                res.property_title = p.properties.title;
            delete res.users;
            delete res.properties;
            return res;
        });
    }
    // Get total revenue
    async getTotalRevenue() {
        const { data, error } = await supabase
            .from('payments')
            .select('amount, status')
            .eq('status', 'COMPLETED');
        if (error)
            throw new Error(error.message);
        return data?.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) || 0;
    }
    // Helper method to handle payment completion logic
    async handlePaymentCompletion(payment) {
        switch (payment.purpose) {
            case 'BOOST':
                // Boost the property
                if (payment.property_id) {
                    const boostDays = 30;
                    const expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + boostDays);
                    await supabase
                        .from('properties')
                        .update({
                        is_boosted: true,
                        boost_expiry: expirationDate.toISOString()
                    })
                        .eq('property_id', payment.property_id);
                }
                break;
            case 'ACCESS':
                // Handle premium access
                console.log('Payment for access completed:', payment.payment_id);
                break;
            case 'BOOKING':
                // Handle booking confirmation
                console.log('Payment for booking completed:', payment.payment_id);
                break;
            case 'DEPOSIT':
                // Handle deposit recording
                console.log('Payment for deposit completed:', payment.payment_id);
                break;
            case 'SUBSCRIPTION':
                // Handle subscription update
                console.log('Payment for subscription completed:', payment.payment_id);
                break;
        }
    }
    // Get monthly revenue report
    async getMonthlyRevenueReport(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const { data: payments, error } = await supabase
            .from('payments')
            .select('amount, created_at')
            .eq('status', 'COMPLETED')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());
        if (error)
            throw new Error(error.message);
        const dailyBreakdown = {};
        let totalRevenue = 0;
        const transactions = payments?.length || 0;
        payments?.forEach(payment => {
            const amount = Number(payment.amount) || 0;
            totalRevenue += amount;
            const createdDate = new Date(payment.created_at);
            const day = createdDate.getDate();
            if (!dailyBreakdown[day]) {
                dailyBreakdown[day] = { revenue: 0, transactions: 0 };
            }
            dailyBreakdown[day].revenue += amount;
            dailyBreakdown[day].transactions += 1;
        });
        const breakdownArray = Object.entries(dailyBreakdown).map(([day, data]) => ({
            day: parseInt(day),
            revenue: data.revenue,
            transactions: data.transactions
        })).sort((a, b) => a.day - b.day);
        return {
            month: `${year}-${month.toString().padStart(2, '0')}`,
            totalRevenue,
            transactions,
            dailyBreakdown: breakdownArray
        };
    }
}
export const paymentsService = new PaymentsService();
//# sourceMappingURL=payments.service.js.map