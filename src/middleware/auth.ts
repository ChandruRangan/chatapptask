import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokenUtils';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header missing' });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ error: 'Token missing' });
    return;
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.userId = decoded.userId;
  next();
};
