export const sanitizeInput = (input: any) => {
    return input.replace(/[^a-zA-Z0-9-_% ]/g, '');
};