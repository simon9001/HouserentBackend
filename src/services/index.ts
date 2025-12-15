import { UsersService } from '../Users/userService.js';

let usersService: UsersService | null = null;

export const initializeServices = () => {
    if (!usersService) {
        usersService = new UsersService();
    }
    return {
        usersService
    };
};

export const getUsersService = (): UsersService => {
    if (!usersService) {
        throw new Error('Services not initialized. Call initializeServices() first.');
    }
    return usersService;
};