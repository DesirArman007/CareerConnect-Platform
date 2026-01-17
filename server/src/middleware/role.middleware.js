import ApiError from "../utils/ApiError.js";


export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const userRole = req.user.role?.toLowerCase();
        const hasRole = allowedRoles.some(role => role.toLowerCase() === userRole);

        if (!hasRole) {
            throw new ApiError(403, `Access denied. Only ${allowedRoles.join(', ')} can access this route`);
        }

        next();
    };
};