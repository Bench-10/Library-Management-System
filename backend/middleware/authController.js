import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Function to generate a signed JWT token with a 1-hour expiration
export const signedToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables!');
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}


export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; 

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedPayload; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or Expired Token' });
    }

} 