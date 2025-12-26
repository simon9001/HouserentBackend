import { userSubscriptionsService } from './userSubscriptions.service.js';
export class SubscriptionCronJobs {
    // Reset monthly usage counters
    static async resetMonthlyUsage() {
        console.log('Starting monthly usage reset...');
        try {
            const resetCount = await userSubscriptionsService.resetMonthlyUsage();
            console.log(`Monthly usage reset completed. Affected: ${resetCount} subscriptions`);
        }
        catch (error) {
            console.error('Error resetting monthly usage:', error.message);
            throw error; // Re-throw for better error handling upstream
        }
    }
    // Check for expiring subscriptions
    static async checkExpiringSubscriptions(days = 7) {
        console.log(`Checking for subscriptions expiring in ${days} days...`);
        try {
            const expiringSubscriptions = await userSubscriptionsService.getExpiringSubscriptions(days);
            for (const subscription of expiringSubscriptions) {
                console.log(`Subscription ${subscription.SubscriptionId} expires on ${subscription.EndDate}`);
                await this.createExpiryEvent(subscription);
            }
            console.log(`Found ${expiringSubscriptions.length} expiring subscriptions`);
            return expiringSubscriptions.length;
        }
        catch (error) {
            console.error('Error checking expiring subscriptions:', error.message);
            throw error;
        }
    }
    // Check for trial ending soon
    static async checkTrialEndingSubscriptions(days = 3) {
        console.log(`Checking for trials ending in ${days} days...`);
        try {
            const endingTrials = await userSubscriptionsService.getTrialEndingSubscriptions(days);
            for (const trial of endingTrials) {
                console.log(`Trial ends on ${trial.TrialEndDate}`);
                await this.createTrialEndingEvent(trial);
            }
            console.log(`Found ${endingTrials.length} trials ending soon`);
            return endingTrials.length;
        }
        catch (error) {
            console.error('Error checking trial ending subscriptions:', error.message);
            throw error;
        }
    }
    // Process subscription renewals
    static async processRenewals() {
        console.log('Processing subscription renewals...');
        try {
            const subscriptionsDue = await this.getSubscriptionsDueForRenewal();
            let renewedCount = 0;
            let failedCount = 0;
            for (const subscription of subscriptionsDue) {
                if (subscription.AutoRenew && subscription.Status === 'ACTIVE') {
                    const success = await this.processRenewal(subscription);
                    if (success) {
                        renewedCount++;
                    }
                    else {
                        failedCount++;
                    }
                }
                else {
                    await this.handleNonRenewingSubscription(subscription);
                }
            }
            console.log(`Processed ${subscriptionsDue.length} subscription renewals (${renewedCount} renewed, ${failedCount} failed)`);
            return { total: subscriptionsDue.length, renewed: renewedCount, failed: failedCount };
        }
        catch (error) {
            console.error('Error processing renewals:', error.message);
            throw error;
        }
    }
    // Clean up old data
    static async cleanupOldData() {
        console.log('Cleaning up old subscription data...');
        try {
            const cleanupCount = await this.performDataCleanup();
            console.log(`Cleaned up ${cleanupCount} old records`);
            return cleanupCount;
        }
        catch (error) {
            console.error('Error cleaning up old data:', error.message);
            throw error;
        }
    }
    // Check for overdue payments
    static async checkOverduePayments() {
        console.log('Checking for overdue payments...');
        try {
            // Implementation would query subscriptions with status 'PAST_DUE'
            // and send notifications or take action
            const overdueSubscriptions = await this.getOverdueSubscriptions();
            for (const subscription of overdueSubscriptions) {
                await this.handleOverduePayment(subscription);
            }
            console.log(`Found ${overdueSubscriptions.length} overdue payments`);
            return overdueSubscriptions.length;
        }
        catch (error) {
            console.error('Error checking overdue payments:', error.message);
            throw error;
        }
    }
    // Sync subscription statuses
    static async syncSubscriptionStatuses() {
        console.log('Syncing subscription statuses...');
        try {
            const updatedCount = await this.updateSubscriptionStatuses();
            console.log(`Updated ${updatedCount} subscription statuses`);
            return updatedCount;
        }
        catch (error) {
            console.error('Error syncing subscription statuses:', error.message);
            throw error;
        }
    }
    // Generate monthly reports
    static async generateMonthlyReports() {
        console.log('Generating monthly subscription reports...');
        try {
            const reportData = await this.generateReports();
            await this.sendReports(reportData);
            console.log('Monthly reports generated and sent');
            return reportData;
        }
        catch (error) {
            console.error('Error generating monthly reports:', error.message);
            throw error;
        }
    }
    // ========== PRIVATE HELPER METHODS ==========
    static async getSubscriptionsDueForRenewal() {
        console.log('Fetching subscriptions due for renewal...');
        // Implementation would query database
        // Example: SELECT * FROM subscriptions WHERE EndDate <= DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND Status IN ('ACTIVE', 'TRIAL')
        return [];
    }
    static async processRenewal(subscription) {
        console.log(`Processing renewal for subscription ${subscription.SubscriptionId}`);
        try {
            // 1. Attempt to charge the payment method
            // 2. If successful, extend subscription and create invoice
            // 3. Return true/false based on success
            return true; // Placeholder
        }
        catch (error) {
            console.error(`Failed to process renewal for subscription ${subscription.SubscriptionId}:`, error);
            return false;
        }
    }
    static async handleNonRenewingSubscription(subscription) {
        console.log(`Handling non-renewing subscription ${subscription.SubscriptionId}`);
        if (subscription.Status === 'ACTIVE') {
            await this.sendRenewalNotice(subscription);
        }
        else if (subscription.Status === 'TRIAL' && subscription.TrialEndDate) {
            await this.sendTrialEndingNotice(subscription);
        }
    }
    static async createExpiryEvent(subscription) {
        console.log(`Creating expiry event for subscription ${subscription.SubscriptionId}`);
        // Implementation: Insert into SubscriptionEvents table
    }
    static async createTrialEndingEvent(subscription) {
        console.log(`Creating trial ending event for subscription ${subscription.SubscriptionId}`);
        // Implementation: Insert into SubscriptionEvents table
    }
    static async sendRenewalNotice(subscription) {
        console.log(`Sending renewal notice for subscription ${subscription.SubscriptionId}`);
        // Implementation: Send email/SMS
    }
    static async sendTrialEndingNotice(subscription) {
        console.log(`Sending trial ending notice for subscription ${subscription.SubscriptionId}`);
        // Implementation: Send email/SMS
    }
    static async performDataCleanup() {
        console.log('Performing data cleanup...');
        // Implementation would archive/delete old data
        return 0;
    }
    static async getOverdueSubscriptions() {
        // Implementation: Query overdue subscriptions
        return [];
    }
    static async handleOverduePayment(subscription) {
        console.log(`Handling overdue payment for subscription ${subscription.SubscriptionId}`);
        // Implementation: Send notifications, update status, etc.
    }
    static async updateSubscriptionStatuses() {
        // Implementation: Update statuses based on dates
        return 0;
    }
    static async generateReports() {
        // Implementation: Generate report data
        return {};
    }
    static async sendReports(reportData) {
        // Implementation: Send reports to admins
    }
}
// Example of how to run these cron jobs
export async function runAllCronJobs() {
    console.log('=== Starting all subscription cron jobs ===');
    try {
        const results = {
            monthlyReset: await SubscriptionCronJobs.resetMonthlyUsage(),
            expiring: await SubscriptionCronJobs.checkExpiringSubscriptions(7),
            trialEnding: await SubscriptionCronJobs.checkTrialEndingSubscriptions(3),
            renewals: await SubscriptionCronJobs.processRenewals(),
            overduePayments: await SubscriptionCronJobs.checkOverduePayments(),
            statusSync: await SubscriptionCronJobs.syncSubscriptionStatuses(),
            cleanup: await SubscriptionCronJobs.cleanupOldData(),
        };
        console.log('=== All cron jobs completed successfully ===');
        return results;
    }
    catch (error) {
        console.error('=== Cron jobs failed ===', error);
        throw error;
    }
}
// Example cron setup (using node-cron)
/*
import cron from 'node-cron';

// Reset monthly usage on the 1st of every month at midnight
cron.schedule('0 0 1 * *', () => {
    SubscriptionCronJobs.resetMonthlyUsage();
});

// Check expiring subscriptions daily at 9 AM
cron.schedule('0 9 * * *', () => {
    SubscriptionCronJobs.checkExpiringSubscriptions(7);
    SubscriptionCronJobs.checkTrialEndingSubscriptions(3);
});

// Process renewals daily at midnight
cron.schedule('0 0 * * *', () => {
    SubscriptionCronJobs.processRenewals();
});

// Check overdue payments every 6 hours
cron.schedule('0 0,6,12,18 * * *', () => {
    SubscriptionCronJobs.checkOverduePayments();
});

// Sync statuses every hour
cron.schedule('0 * * * *', () => {
    SubscriptionCronJobs.syncSubscriptionStatuses();
});

// Cleanup old data weekly on Sunday at 2 AM
cron.schedule('0 2 * * 0', () => {
    SubscriptionCronJobs.cleanupOldData();
});

// Generate reports on the 1st of every month at 3 AM
cron.schedule('0 3 1 * *', () => {
    SubscriptionCronJobs.generateMonthlyReports();
});
*/
// Manual trigger for testing
if (process.env.NODE_ENV === 'development' && process.argv.includes('--run-cron')) {
    runAllCronJobs().catch(console.error);
}
//# sourceMappingURL=subscription.cron.js.map