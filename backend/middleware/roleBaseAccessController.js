export const authorize = (allowedRoles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(500).json({ message: 'Server Error: Authentication middleware missing.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access Forbidden: You are a ${req.user.role}, but this requires ${allowedRoles.join(' or ')}.` 
            });
        }

        next();
    };
};