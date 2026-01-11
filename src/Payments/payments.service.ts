import { supabase } from '../Database/config.js';
import { ValidationUtils } from '../utils/validators.js';

export interface Payment {
    PaymentId: string;
    UserId: string;
    PropertyId?: string;
    Amount: number;
    Currency: string;
    PaymentProvider: string;
    ProviderReference: string;
    Purpose: 'ACCESS' | 'BOOST' | 'SUBSCRIPTION' | 'BOOKING' | 'DEPOSIT';
    Status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    CreatedAt: Date;
    CompletedAt?: Date;
    // Joins
    UserName?: string;
    PropertyTitle?: string;
}

export interface CreatePaymentInput {
    userId: string;
    propertyId?: string;
    amount: number;
    currency?: string;
    paymentProvider: string;
    providerReference: string;
    purpose: Payment['Purpose'];
}

export interface UpdatePaymentInput {
    status?: Payment['Status'];
    providerReference?: string;
    completedAt?: Date;
}

export class PaymentsService {

    // Create new payment
    async createPayment(data: CreatePaymentInput): Promise<Payment> {
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

        if (error) throw new Error(error.message);

        return newPayment as Payment;
    }

    // Get payment by ID
    async getPaymentById(paymentId: string): Promise<Payment & { UserName?: string; PropertyTitle?: string }> {
        if (!ValidationUtils.isValidUUID(paymentId)) throw new Error('Invalid payment ID format');

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
            if (error.code === 'PGRST116') return null as any;
            throw new Error(error.message);
        }

        const result: any = { ...data };
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
    async getPaymentsByUserId(userId: string, status?: string): Promise<Payment[]> {
        if (!ValidationUtils.isValidUUID(userId)) throw new Error('Invalid user ID format');

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
        if (error) throw new Error(error.message);

        return data.map((p: any) => {
            const res = { ...p };
            if (p.Properties) {
                res.PropertyTitle = p.Properties.Title;
                delete p.Properties;
            }
            return res;
        });
    }

    // Get payments by property ID
    async getPaymentsByPropertyId(propertyId: string): Promise<Payment[]> {
        if (!ValidationUtils.isValidUUID(propertyId)) throw new Error('Invalid property ID format');

        const { data, error } = await supabase
            .from('Payments')
            .select(`
                *,
                Users:UserId (FullName)
            `)
            .eq('PropertyId', propertyId)
            .order('CreatedAt', { ascending: false });

        if (error) throw new Error(error.message);

        return data.map((p: any) => {
            const res = { ...p };
            if (p.Users) {
                res.UserName = p.Users.FullName;
                delete p.Users;
            }
            return res;
        });
    }

    // Update payment status
    async updatePayment(paymentId: string, data: UpdatePaymentInput): Promise<Payment> {
        if (!ValidationUtils.isValidUUID(paymentId)) throw new Error('Invalid payment ID format');

        // Get current payment
        const currentPayment = await this.getPaymentById(paymentId);
        if (!currentPayment) {
            throw new Error('Payment not found');
        }

        const updates: any = {};
        if (data.status !== undefined) {
            updates.Status = data.status;

            if (data.status === 'COMPLETED') {
                updates.CompletedAt = new Date().toISOString(); // SYSDATETIME equivalent
            } else if (currentPayment.Status === 'COMPLETED' && data.status !== 'COMPLETED') {
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

        if (error) throw new Error(error.message);

        // Handle payment completion logic
        if (data.status === 'COMPLETED') {
            await this.handlePaymentCompletion(updatedPayment as Payment);
        }

        return updatedPayment as Payment;
    }

    // Complete payment
    async completePayment(paymentId: string): Promise<Payment> {
        return this.updatePayment(paymentId, { status: 'COMPLETED' });
    }

    // Fail payment
    async failPayment(paymentId: string, _reason?: string): Promise<Payment> {
        return this.updatePayment(paymentId, { status: 'FAILED' });
    }

    // Refund payment
    async refundPayment(paymentId: string): Promise<Payment> {
        return this.updatePayment(paymentId, { status: 'REFUNDED' });
    }

    // Get payment statistics
    async getPaymentStatistics(userId?: string, startDate?: Date, endDate?: Date): Promise<{
        totalAmount: number;
        completedAmount: number;
        pendingAmount: number;
        failedAmount: number;
        refundedAmount: number;
        totalTransactions: number;
        completedTransactions: number;
        pendingTransactions: number;
        failedTransactions: number;
        refundedTransactions: number;
        recentTransactions: number; // Placeholder/Mock
    }> {
        // Fetch relevant payments to aggregate
        // Note: For large datasets, use RPC. For migration compatibility, we aggregate in JS.
        let query = supabase.from('Payments').select('Amount, Status, CreatedAt');

        if (userId) query = query.eq('UserId', userId);
        if (startDate) query = query.gte('CreatedAt', startDate.toISOString());
        if (endDate) query = query.lte('CreatedAt', endDate.toISOString());

        const { data: payments, error } = await query;
        if (error) throw new Error(error.message);

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
            payments.forEach((p: any) => {
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
    async getRecentPayments(limit: number = 10): Promise<Payment[]> {
        const { data, error } = await supabase
            .from('Payments')
            .select(`
                *,
                Users:UserId (FullName),
                Properties:PropertyId (Title)
            `)
            .order('CreatedAt', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);

        return data.map((p: any) => {
            const res = { ...p };
            if (p.Users) res.UserName = p.Users.FullName;
            if (p.Properties) res.PropertyTitle = p.Properties.Title;
            delete p.Users;
            delete p.Properties;
            return res;
        });
    }

    // Search payments
    async searchPayments(searchTerm: string, userId?: string): Promise<Payment[]> {
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

        if (error) throw new Error(error.message);

        return data.map((p: any) => {
            const res = { ...p };
            if (p.Users) res.UserName = p.Users.FullName;
            if (p.Properties) res.PropertyTitle = p.Properties.Title;
            delete p.Users;
            delete p.Properties;
            return res;
        });
    }

    // Helper method to handle payment completion logic
    private async handlePaymentCompletion(payment: Payment): Promise<void> {
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
