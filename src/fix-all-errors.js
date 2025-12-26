// fix-all-errors.js
const fs = require('fs');
const path = require('path');

console.log('Fixing all TypeScript errors...');

// 1. Fix adminController.ts
const adminControllerPath = path.join(process.cwd(), 'src/admin/adminController.ts');
if (fs.existsSync(adminControllerPath)) {
    let content = fs.readFileSync(adminControllerPath, 'utf8');
    
    // Comment out unused type imports
    content = content.replace(/type SubscriptionEvent,/g, '// type SubscriptionEvent,');
    content = content.replace(/type UsageLog,/g, '// type UsageLog,');
    
    // Fix unused variables
    content = content.replace(/const startDate = c\.req\.query\('startDate'\);/g, 'const _startDate = c.req.query(\'startDate\');');
    content = content.replace(/const endDate = c\.req\.query\('endDate'\);/g, 'const _endDate = c.req.query(\'endDate\');');
    
    fs.writeFileSync(adminControllerPath, content, 'utf8');
    console.log('✓ Fixed adminController.ts');
}

// 2. Fix adminService.ts
const adminServicePath = path.join(process.cwd(), 'src/admin/adminService.ts');
if (fs.existsSync(adminServicePath)) {
    let content = fs.readFileSync(adminServicePath, 'utf8');
    
    // Fix all unused parameters
    content = content.replace(/newEndDate\?: Date,/g, '_newEndDate?: Date,');
    content = content.replace(/priceOverride\?: number,/g, '_priceOverride?: number,');
    content = content.replace(/notes\?: string/g, '_notes?: string');
    content = content.replace(/reason\?: string/g, '_reason?: string');
    content = content.replace(/newPlanId\?: string,/g, '_newPlanId?: string,');
    content = content.replace(/startDate\?: Date,/g, '_startDate?: Date,');
    content = content.replace(/price\?: number,/g, '_price?: number,');
    content = content.replace(/expiryDate\?: Date,/g, '_expiryDate?: Date,');
    content = content.replace(/subscriptionId: string,/g, '_subscriptionId: string,');
    content = content.replace(/description\?: string,/g, '_description?: string,');
    content = content.replace(/items\?: any\[\]/g, '_items?: any[]');
    content = content.replace(/const invoiceNumber = /g, 'const _invoiceNumber = ');
    
    fs.writeFileSync(adminServicePath, content, 'utf8');
    console.log('✓ Fixed adminService.ts');
}

// 3. Fix agentRoutes.ts
const agentRoutesPath = path.join(process.cwd(), 'src/AgentVerification/agentRoutes.ts');
if (fs.existsSync(agentRoutesPath)) {
    let content = fs.readFileSync(agentRoutesPath, 'utf8');
    content = content.replace(/const existingVerification = await/g, 'const _existingVerification = await');
    fs.writeFileSync(agentRoutesPath, content, 'utf8');
    console.log('✓ Fixed agentRoutes.ts');
}

// 4. Fix agentService.ts
const agentServicePath = path.join(process.cwd(), 'src/AgentVerification/agentService.ts');
if (fs.existsSync(agentServicePath)) {
    let content = fs.readFileSync(agentServicePath, 'utf8');
    content = content.replace(/const db = await this\.getDb\(\);/g, 'const _db = await this.getDb();');
    fs.writeFileSync(agentServicePath, content, 'utf8');
    console.log('✓ Fixed agentService.ts');
}

// 5. Fix auth.middleware.ts - add proper return types
const authMiddlewarePath = path.join(process.cwd(), 'src/middleware/auth.middleware.ts');
if (fs.existsSync(authMiddlewarePath)) {
    let content = fs.readFileSync(authMiddlewarePath, 'utf8');
    
    // Add return type to authenticate function
    content = content.replace(
        /export const authenticate = async \(c: AuthContext, next: Next\) => {/,
        'export const authenticate = async (c: AuthContext, next: Next): Promise<Response | void> => {'
    );
    
    // Add return type to authorize return function
    content = content.replace(
        /return async \(c: AuthContext, next: Next\) => {/,
        'return async (c: AuthContext, next: Next): Promise<Response | void> => {'
    );
    
    fs.writeFileSync(authMiddlewarePath, content, 'utf8');
    console.log('✓ Fixed auth.middleware.ts');
}

// 6. Fix subscription.middleware.ts
const subscriptionMiddlewarePath = path.join(process.cwd(), 'src/middleware/subscription.middleware.ts');
if (fs.existsSync(subscriptionMiddlewarePath)) {
    let content = fs.readFileSync(subscriptionMiddlewarePath, 'utf8');
    
    // Add return types to both middleware functions
    content = content.replace(
        /return async \(c: Context, next: Next\) => {/g,
        'return async (c: Context, next: Next): Promise<Response | void> => {'
    );
    
    fs.writeFileSync(subscriptionMiddlewarePath, content, 'utf8');
    console.log('✓ Fixed subscription.middleware.ts');
}

// 7. Fix payments.routes.ts
const paymentsRoutesPath = path.join(process.cwd(), 'src/Payments/payments.routes.ts');
if (fs.existsSync(paymentsRoutesPath)) {
    let content = fs.readFileSync(paymentsRoutesPath, 'utf8');
    content = content.replace(/import { authenticate, authorize }/g, 'import { authenticate }');
    fs.writeFileSync(paymentsRoutesPath, content, 'utf8');
    console.log('✓ Fixed payments.routes.ts');
}

// 8. Fix payments.service.ts
const paymentsServicePath = path.join(process.cwd(), 'src/Payments/payments.service.ts');
if (fs.existsSync(paymentsServicePath)) {
    let content = fs.readFileSync(paymentsServicePath, 'utf8');
    content = content.replace(/reason\?: string/g, '_reason?: string');
    fs.writeFileSync(paymentsServicePath, content, 'utf8');
    console.log('✓ Fixed payments.service.ts');
}

// 9. Fix properties.routes.ts
const propertiesRoutesPath = path.join(process.cwd(), 'src/Properties/properties.routes.ts');
if (fs.existsSync(propertiesRoutesPath)) {
    let content = fs.readFileSync(propertiesRoutesPath, 'utf8');
    content = content.replace(/import { subscriptionGate }/g, '// import { subscriptionGate }');
    fs.writeFileSync(propertiesRoutesPath, content, 'utf8');
    console.log('✓ Fixed properties.routes.ts');
}

// 10. Fix properties.service.ts
const propertiesServicePath = path.join(process.cwd(), 'src/Properties/properties.service.ts');
if (fs.existsSync(propertiesServicePath)) {
    let content = fs.readFileSync(propertiesServicePath, 'utf8');
    content = content.replace(/let baseCondition = '';/g, 'let _baseCondition = \'\';');
    fs.writeFileSync(propertiesServicePath, content, 'utf8');
    console.log('✓ Fixed properties.service.ts');
}

// 11. Fix propertyAmenities.controller.ts
const propAmenitiesCtrlPath = path.join(process.cwd(), 'src/PropertyAmenities/propertyAmenities.controller.ts');
if (fs.existsSync(propAmenitiesCtrlPath)) {
    let content = fs.readFileSync(propAmenitiesCtrlPath, 'utf8');
    content = content.replace(/const deleted = await/g, 'const _deleted = await');
    fs.writeFileSync(propAmenitiesCtrlPath, content, 'utf8');
    console.log('✓ Fixed propertyAmenities.controller.ts');
}

// 12. Fix propertyMedia.service.ts
const propertyMediaPath = path.join(process.cwd(), 'src/PropertyMedia/propertyMedia.service.ts');
if (fs.existsSync(propertyMediaPath)) {
    let content = fs.readFileSync(propertyMediaPath, 'utf8');
    content = content.replace(/const db = await this\.getDb\(\);/g, 'const _db = await this.getDb();');
    fs.writeFileSync(propertyMediaPath, content, 'utf8');
    console.log('✓ Fixed propertyMedia.service.ts');
}

// 13. Fix subscription.cron.ts
const subscriptionCronPath = path.join(process.cwd(), 'src/Subscription/subscription.cron.ts');
if (fs.existsSync(subscriptionCronPath)) {
    let content = fs.readFileSync(subscriptionCronPath, 'utf8');
    content = content.replace(/reportData: any/g, '_reportData: any');
    fs.writeFileSync(subscriptionCronPath, content, 'utf8');
    console.log('✓ Fixed subscription.cron.ts');
}

// 14. Fix userSubscriptions.controller.ts
const userSubsCtrlPath = path.join(process.cwd(), 'src/Subscription/userSubscriptions.controller.ts');
if (fs.existsSync(userSubsCtrlPath)) {
    let content = fs.readFileSync(userSubsCtrlPath, 'utf8');
    content = content.replace(/UsageCheckResult/g, '// UsageCheckResult');
    fs.writeFileSync(userSubsCtrlPath, content, 'utf8');
    console.log('✓ Fixed userSubscriptions.controller.ts');
}

// 15. Fix userSubscriptions.service.ts
const userSubsServicePath = path.join(process.cwd(), 'src/Subscription/userSubscriptions.service.ts');
if (fs.existsSync(userSubsServicePath)) {
    let content = fs.readFileSync(userSubsServicePath, 'utf8');
    content = content.replace(/const db = await this\.getDb\(\);/g, 'const _db = await this.getDb();');
    fs.writeFileSync(userSubsServicePath, content, 'utf8');
    console.log('✓ Fixed userSubscriptions.service.ts');
}

console.log('\n✅ All files fixed!');
console.log('Run: pnpm run build');