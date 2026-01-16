/**
 * Utility functions for transforming data keys between snake_case and camelCase.
 */

/**
 * Converts a snake_case string to camelCase.
 */
export const snakeToCamel = (str: string): string => {
    return str.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
};

/**
 * Converts a camelCase string to snake_case.
 */
export const camelToSnake = (str: string): string => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Recursively transforms all keys in an object from snake_case to camelCase.
 */
export const transformKeysToCamel = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map((v) => transformKeysToCamel(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [snakeToCamel(key)]: transformKeysToCamel(obj[key]),
            }),
            {}
        );
    }
    return obj;
};

/**
 * Recursively transforms all keys in an object from camelCase to snake_case.
 */
export const transformKeysToSnake = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map((v) => transformKeysToSnake(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [camelToSnake(key)]: transformKeysToSnake(obj[key]),
            }),
            {}
        );
    }
    return obj;
};
