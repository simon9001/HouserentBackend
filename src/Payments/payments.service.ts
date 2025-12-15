import sql from 'mssql';
import { getConnectionPool } from '../Database/config.js';
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
    private db: sql.ConnectionPool | null = null;

    constructor() {
        // Lazy initialization
    }

    private async getDb(): Promise<sql.ConnectionPool> {
        if (!this.db) {
            this.db = getConnectionPool();
        }
        return this.db;
    }

    // Create new payment
    async createPayment(data: CreatePaymentInput): Promise<Payment> {
        const db = await this.getDb();
        
        // Validate amount
        if (data.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        // Validate user exists
        const userCheck = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .query('SELECT UserId FROM Users WHERE UserId = @userId AND IsActive = 1');
        
        if (userCheck.recordset.length === 0) {
            throw new Error('User not found or inactive');
        }

        // Validate property exists if provided
        if (data.propertyId) {
            const propertyCheck = await db.request()
                .input('propertyId', sql.UniqueIdentifier, data.propertyId)
                .query('SELECT PropertyId FROM Properties WHERE PropertyId = @propertyId');
            
            if (propertyCheck.recordset.length === 0) {
                throw new Error('Property not found');
            }
        }

        // Check for duplicate provider reference
        const duplicateCheck = await db.request()
            .input('providerReference', sql.NVarChar(150), data.providerReference)
            .query('SELECT PaymentId FROM Payments WHERE ProviderReference = @providerReference');
        
        if (duplicateCheck.recordset.length > 0) {
            throw new Error('Duplicate provider reference');
        }

        const query = `
            INSERT INTO Payments (UserId, PropertyId, Amount, Currency, PaymentProvider, ProviderReference, Purpose, Status)
            OUTPUT INSERTED.*
            VALUES (@userId, @propertyId, @amount, @currency, @paymentProvider, @providerReference, @purpose, 'PENDING')
        `;

        const result = await db.request()
            .input('userId', sql.UniqueIdentifier, data.userId)
            .input('propertyId', sql.UniqueIdentifier, data.propertyId || null)
            .input('amount', sql.Decimal(10, 2), data.amount)
            .input('currency', sql.NVarChar(10), data.currency || 'KES')
            .input('paymentProvider', sql.NVarChar(50), data.paymentProvider)
            .input('providerReference', sql.NVarChar(150), data.providerReference)
            .input('purpose', sql.NVarChar(50), data.purpose)
            .query(query);

        return result.recordset[0];
    }

    // Get payment by ID
    async getPaymentById(paymentId: string): Promise<Payment & { UserName?: string; PropertyTitle?: string }> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(paymentId)) {
            throw new Error('Invalid payment ID format');
        }

        const query = `
            SELECT 
                p.*,
                u.FullName as UserName,
                pr.Title as PropertyTitle
            FROM Payments p
            INNER JOIN Users u ON p.UserId = u.UserId
            LEFT JOIN Properties pr ON p.PropertyId = pr.PropertyId
            WHERE p.PaymentId = @paymentId
        `;

        const result = await db.request()
            .input('paymentId', sql.UniqueIdentifier, paymentId)
            .query(query);

        return result.recordset[0] || null;
    }

    // Get payments by user ID
    async getPaymentsByUserId(userId: string, status?: string): Promise<Payment[]> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(userId)) {
            throw new Error('Invalid user ID format');
        }

        let whereClause = 'WHERE UserId = @userId';
        if (status) {
            whereClause += ' AND Status = @status';
        }

        const query = `
            SELECT p.*, pr.Title as PropertyTitle
            FROM Payments p
            LEFT JOIN Properties pr ON p.PropertyId = pr.PropertyId
            ${whereClause}
            ORDER BY p.CreatedAt DESC
        `;

        const request = db.request()
            .input('userId', sql.UniqueIdentifier, userId);
        
        if (status) {
            request.input('status', sql.NVarChar(20), status);
        }

        const result = await request.query(query);
        return result.recordset;
    }

    // Get payments by property ID
    async getPaymentsByPropertyId(propertyId: string): Promise<Payment[]> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(propertyId)) {
            throw new Error('Invalid property ID format');
        }

        const query = `
            SELECT p.*, u.FullName as UserName
            FROM Payments p
            INNER JOIN Users u ON p.UserId = u.UserId
            WHERE p.PropertyId = @propertyId
            ORDER BY p.CreatedAt DESC
        `;

        const result = await db.request()
            .input('propertyId', sql.UniqueIdentifier, propertyId)
            .query(query);

        return result.recordset;
    }

    // Update payment status - FIXED VERSION
    async updatePayment(paymentId: string, data: UpdatePaymentInput): Promise<Payment> {
        const db = await this.getDb();
        
        if (!ValidationUtils.isValidUUID(paymentId)) {
            throw new Error('Invalid payment ID format');
        }

        // Get current payment
        const currentPayment = await this.getPaymentById(paymentId);
        if (!currentPayment) {
            throw new Error('Payment not found');
        }

        // Build dynamic update query
        const updates: string[] = [];
        const inputs: any = { paymentId };

        if (data.status !== undefined) {
            updates.push('Status = @status');
            inputs.status = data.status;
            
            // Set completedAt if status is COMPLETED
            if (data.status === 'COMPLETED') {
                updates.push('CompletedAt = SYSDATETIME()');
            } 
            // Only clear CompletedAt if we're changing from COMPLETED to another status
            else if (currentPayment.Status === 'COMPLETED') {
                // Explicitly check that data.status is not COMPLETED
                // TypeScript doesn't understand this logic, so we need to be explicit
                const newStatus = data.status as Payment['Status'];
                if (newStatus !== 'COMPLETED') {
                    updates.push('CompletedAt = NULL');
                }
            }
        }
        
        if (data.providerReference !== undefined) {
            updates.push('ProviderReference = @providerReference');
            inputs.providerReference = data.providerReference;
        }
        
        if (data.completedAt !== undefined) {
            updates.push('CompletedAt = @completedAt');
            inputs.completedAt = data.completedAt;
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        const query = `
            UPDATE Payments 
            SET ${updates.join(', ')}
            OUTPUT INSERTED.*
            WHERE PaymentId = @paymentId
        `;

        const request = db.request()
            .input('paymentId', sql.UniqueIdentifier, inputs.paymentId);

        // Add inputs dynamically
        Object.keys(inputs).forEach(key => {
            if (key !== 'paymentId') {
                let sqlType: any = sql.NVarChar;
                if (key === 'completedAt') {
                    sqlType = sql.DateTime;
                } else if (key === 'status') {
                    sqlType = sql.NVarChar(20);
                }
                request.input(key, sqlType, inputs[key]);
            }
        });

        const result = await request.query(query);

        // Handle payment completion logic
        if (data.status === 'COMPLETED') {
            await this.handlePaymentCompletion(currentPayment);
        }

        return result.recordset[0];
    }

    // Complete payment
    async completePayment(paymentId: string): Promise<Payment> {
        return this.updatePayment(paymentId, { status: 'COMPLETED' });
    }

    // Fail payment
    async failPayment(paymentId: string, reason?: string): Promise<Payment> {
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
    }> {
        const db = await this.getDb();

        let whereClause = 'WHERE 1=1';
        if (userId) {
            whereClause += ' AND UserId = @userId';
        }
        if (startDate) {
            whereClause += ' AND CreatedAt >= @startDate';
        }
        if (endDate) {
            whereClause += ' AND CreatedAt <= @endDate';
        }

        const query = `
            SELECT 
                SUM(Amount) as totalAmount,
                SUM(CASE WHEN Status = 'COMPLETED' THEN Amount ELSE 0 END) as completedAmount,
                SUM(CASE WHEN Status = 'PENDING' THEN Amount ELSE 0 END) as pendingAmount,
                SUM(CASE WHEN Status = 'FAILED' THEN Amount ELSE 0 END) as failedAmount,
                SUM(CASE WHEN Status = 'REFUNDED' THEN Amount ELSE 0 END) as refundedAmount,
                COUNT(*) as totalTransactions,
                SUM(CASE WHEN Status = 'COMPLETED' THEN 1 ELSE 0 END) as completedTransactions,
                SUM(CASE WHEN Status = 'PENDING' THEN 1 ELSE 0 END) as pendingTransactions,
                SUM(CASE WHEN Status = 'FAILED' THEN 1 ELSE 0 END) as failedTransactions,
                SUM(CASE WHEN Status = 'REFUNDED' THEN 1 ELSE 0 END) as refundedTransactions
            FROM Payments
            ${whereClause}
        `;

        const request = db.request();
        if (userId) request.input('userId', sql.UniqueIdentifier, userId);
        if (startDate) request.input('startDate', sql.DateTime, startDate);
        if (endDate) request.input('endDate', sql.DateTime, endDate);

        const result = await request.query(query);
        const data = result.recordset[0];
        
        return {
            totalAmount: parseFloat(data.totalAmount || 0),
            completedAmount: parseFloat(data.completedAmount || 0),
            pendingAmount: parseFloat(data.pendingAmount || 0),
            failedAmount: parseFloat(data.failedAmount || 0),
            refundedAmount: parseFloat(data.refundedAmount || 0),
            totalTransactions: parseInt(data.totalTransactions || 0),
            completedTransactions: parseInt(data.completedTransactions || 0),
            pendingTransactions: parseInt(data.pendingTransactions || 0),
            failedTransactions: parseInt(data.failedTransactions || 0),
            refundedTransactions: parseInt(data.refundedTransactions || 0)
        };
    }

    // Get recent payments
    async getRecentPayments(limit: number = 10): Promise<Payment[]> {
        const db = await this.getDb();

        const query = `
            SELECT TOP ${limit}
                p.*,
                u.FullName as UserName,
                pr.Title as PropertyTitle
            FROM Payments p
            INNER JOIN Users u ON p.UserId = u.UserId
            LEFT JOIN Properties pr ON p.PropertyId = pr.PropertyId
            ORDER BY p.CreatedAt DESC
        `;

        const result = await db.request().query(query);
        return result.recordset;
    }

    // Search payments
    async searchPayments(searchTerm: string, userId?: string): Promise<Payment[]> {
        const db = await this.getDb();
        
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new Error('Search term must be at least 2 characters');
        }

        let whereClause = 'WHERE (p.ProviderReference LIKE @searchTerm OR u.FullName LIKE @searchTerm OR pr.Title LIKE @searchTerm)';
        if (userId) {
            whereClause += ' AND p.UserId = @userId';
        }

        const query = `
            SELECT 
                p.*,
                u.FullName as UserName,
                pr.Title as PropertyTitle
            FROM Payments p
            INNER JOIN Users u ON p.UserId = u.UserId
            LEFT JOIN Properties pr ON p.PropertyId = pr.PropertyId
            ${whereClause}
            ORDER BY p.CreatedAt DESC
        `;

        const request = db.request()
            .input('searchTerm', sql.NVarChar, `%${searchTerm}%`);
        
        if (userId) {
            request.input('userId', sql.UniqueIdentifier, userId);
        }

        const result = await request.query(query);
        return result.recordset;
    }

    // Helper method to handle payment completion logic
    private async handlePaymentCompletion(payment: Payment): Promise<void> {
        const db = await this.getDb();

        switch (payment.Purpose) {
            case 'BOOST':
                // Boost the property
                if (payment.PropertyId) {
                    await db.request()
                        .input('propertyId', sql.UniqueIdentifier, payment.PropertyId)
                        .input('boostDays', sql.Int, 30) // Default 30 days boost
                        .query(`
                            UPDATE Properties 
                            SET IsBoosted = 1, BoostExpiry = DATEADD(DAY, @boostDays, SYSDATETIME())
                            WHERE PropertyId = @propertyId
                        `);
                }
                break;

            case 'ACCESS':
                // Grant premium access to user
                await db.request()
                    .input('userId', sql.UniqueIdentifier, payment.UserId)
                    .query(`
                        -- Add your premium access logic here
                        -- Example: UPDATE Users SET HasPremiumAccess = 1, PremiumExpiry = DATEADD(DAY, 30, SYSDATETIME()) WHERE UserId = @userId
                    `);
                break;

            case 'BOOKING':
                // Confirm property visit booking
                if (payment.PropertyId) {
                    await db.request()
                        .input('propertyId', sql.UniqueIdentifier, payment.PropertyId)
                        .input('userId', sql.UniqueIdentifier, payment.UserId)
                        .query(`
                            -- Update property visit status for this user and property
                            -- Example: UPDATE PropertyVisits SET Status = 'CONFIRMED' WHERE PropertyId = @propertyId AND TenantId = @userId AND Status = 'PENDING'
                        `);
                }
                break;

            case 'DEPOSIT':
                // Handle property deposit
                if (payment.PropertyId) {
                    await db.request()
                        .input('propertyId', sql.UniqueIdentifier, payment.PropertyId)
                        .input('userId', sql.UniqueIdentifier, payment.UserId)
                        .input('amount', sql.Decimal(10, 2), payment.Amount)
                        .query(`
                            -- Record deposit payment
                            -- Example: INSERT INTO PropertyDeposits (PropertyId, UserId, Amount, Status) VALUES (@propertyId, @userId, @amount, 'PAID')
                        `);
                }
                break;

            case 'SUBSCRIPTION':
                // Handle subscription
                await db.request()
                    .input('userId', sql.UniqueIdentifier, payment.UserId)
                    .query(`
                        -- Update user subscription
                        -- Example: UPDATE Users SET SubscriptionPlan = 'PREMIUM', SubscriptionExpiry = DATEADD(MONTH, 1, SYSDATETIME()) WHERE UserId = @userId
                    `);
                break;
        }
    }
}

export const paymentsService = new PaymentsService();