import { UsersService } from '../Users/userService.js';
let usersService = null;
export const initializeServices = () => {
    if (!usersService) {
        usersService = new UsersService();
    }
    return {
        usersService
    };
};
export const getUsersService = () => {
    if (!usersService) {
        throw new Error('Services not initialized. Call initializeServices() first.');
    }
    return usersService;
};
//# sourceMappingURL=index.js.map