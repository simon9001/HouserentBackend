export interface Notification {
    NotificationId: string;
    UserId: string;
    Title: string;
    Message: string;
    Type: 'BOOKING' | 'PAYMENT' | 'REVIEW' | 'SYSTEM' | 'ALERT';
    ReferenceId?: string;
    IsRead: boolean;
    CreatedAt: Date;
    UpdatedAt: Date;
}
export interface CreateNotificationInput {
    userId: string;
    title: string;
    message: string;
    type: 'BOOKING' | 'PAYMENT' | 'REVIEW' | 'SYSTEM' | 'ALERT';
    referenceId?: string;
}
export declare class NotificationService {
    private mapDBToNotification;
    getNotificationsByUser(userId: string): Promise<Notification[]>;
    markAsRead(notificationId: string, userId: string): Promise<boolean>;
    markAllAsRead(userId: string): Promise<boolean>;
    createNotification(input: CreateNotificationInput): Promise<Notification>;
    getUnreadCount(userId: string): Promise<number>;
    createBroadcastNotification(title: string, message: string, type?: 'SYSTEM' | 'ALERT'): Promise<number>;
    createClientNotification(agentId: string, title: string, message: string): Promise<number>;
    deleteNotification(notificationId: string, userId: string): Promise<boolean>;
    clearAllNotifications(userId: string): Promise<boolean>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notifications.service.d.ts.map