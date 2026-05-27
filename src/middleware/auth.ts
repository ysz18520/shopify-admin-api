import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'coollaa-admin-secret-key';

export interface AuthUser {
  username: string;
  role: 'super' | 'site';
  site: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function generateToken(username: string, role: 'super' | 'site', site: string): string {
  return jwt.sign({ username, role, site }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.user = payload;
  next();
}

/**
 * Site filter middleware: injects req.query.site based on user role.
 * Super admin can pass ?site=xxx to view a specific site, or omit to view all.
 * Site admin always sees their own site.
 */
export function siteFilterMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.user.role === 'site') {
    // Force site filter for non-super users
    (req.query as any).site = req.user.site;
  }
  // For super users, allow optional ?site filter; if omitted, controller should handle "all sites"

  next();
}
