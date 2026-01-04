import { Context } from 'hono';
import { StatusService } from './status.service.js';
import { AuthContext } from '../middleware/auth.middleware.js';

const statusService = new StatusService();

export const createStatus = async (c: AuthContext) => {
    try {
        const body = await c.req.json();
        const { mediaUrl, textContent, backgroundColor, type } = body;

        const userId = c.user?.userId;

        if (!userId) {
            return c.json({ message: "Unauthorized" }, 401);
        }

        const newStatus = await statusService.createStatus({
            UserId: userId,
            MediaUrl: mediaUrl,
            TextContent: textContent,
            BackgroundColor: backgroundColor,
            Type: type || 'TEXT'
        });

        return c.json(newStatus, 201);
    } catch (error) {
        console.error("Create Status Error:", error);
        return c.json({ message: "Failed to create status" }, 500);
    }
};

export const getActiveStatuses = async (c: Context) => {
    try {
        const statuses = await statusService.getActiveStatuses();

        // Group statuses by user for the "Story" format
        const groupedStatuses = statuses.reduce((acc: any, status: any) => {
            const userId = status.UserId;
            if (!acc[userId]) {
                acc[userId] = {
                    user: {
                        id: userId,
                        username: status.Username,
                        fullName: status.FullName,
                        role: status.Role,
                        // Add avatar if available
                    },
                    stories: []
                };
            }
            acc[userId].stories.push({
                id: status.StatusId,
                mediaUrl: status.MediaUrl,
                textContent: status.TextContent,
                backgroundColor: status.BackgroundColor,
                type: status.Type,
                createdAt: status.CreatedAt,
                expiresAt: status.ExpiresAt
            });
            return acc;
        }, {});

        return c.json(Object.values(groupedStatuses), 200);
    } catch (error) {
        console.error("Get Statuses Error:", error);
        return c.json({ message: "Failed to fetch statuses" }, 500);
    }
};

export const deleteStatus = async (c: AuthContext) => {
    try {
        const id = c.req.param('id');
        const userId = c.user?.userId;

        if (!userId) {
            return c.json({ message: "Unauthorized" }, 401);
        }

        await statusService.deleteStatus(id, userId);
        return c.json({ message: "Status deleted successfully" }, 200);
    } catch (error) {
        console.error("Delete Status Error:", error);
        return c.json({ message: "Failed to delete status" }, 500);
    }
};
