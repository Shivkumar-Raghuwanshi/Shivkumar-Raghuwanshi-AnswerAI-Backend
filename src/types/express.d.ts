import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        // Add any other properties included in the JWT payload
      };
    }
  }
}