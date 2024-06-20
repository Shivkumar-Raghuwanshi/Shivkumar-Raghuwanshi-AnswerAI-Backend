import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface DecodedToken {
  userId: number;
  // Add any other properties included in the JWT payload
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken || req.headers.authorization;

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token not provided' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as DecodedToken;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid access token' });
  }
};

export default authMiddleware;