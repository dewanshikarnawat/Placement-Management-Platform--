import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserProfileModel from '../models/User.js';

// Extend Express Request interface locally to support user contexts
export interface AuthenticatedRequest extends Request {
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'incipio_secret_key_107';

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required. Access denied.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await UserProfileModel.findOne({ id: decoded.id });
    if (!user) {
      return res.status(401).json({ error: 'User associated with this token does not exist.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session expired or invalid token.' });
  }
};

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ error: 'Administrative privileges required.' });
  }
};

export const companyMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'Company' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Recruiter or Administrative privileges required.' });
  }
};

export const studentMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'Student' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Student or Administrative privileges required.' });
  }
};

export const facultyMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'Faculty' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Faculty or Administrative privileges required.' });
  }
};
