// middleware/auth.js
import jwt from 'jsonwebtoken';
import 'dotenv/config';

/**
 * Middleware to verify JWT token and attach user ID to request object.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects 'Bearer TOKEN'

    if (token == null) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in environment variables.");
        }
        
        // The token payload contains { personId: 'uuid-string' }
        const user = jwt.verify(token, secret);
        req.personId = user.personId; 
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
             return res.status(401).json({ message: "Token expired." });
        }
        return res.status(403).json({ message: "Invalid or corrupt token." });
    }
};

export default authenticateToken;
