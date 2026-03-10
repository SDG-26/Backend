import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from '#config';

const authenticate: RequestHandler = (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken) throw new Error('Not authenticated', { cause: { status: 401 } });

  try {
    const decoded = jwt.verify(accessToken, ACCESS_JWT_SECRET) as jwt.JwtPayload;
    if (!decoded.sub) throw new Error();

    const user = {
      id: decoded.sub,
      roles: decoded.roles
    } as { id: string; roles: string[] };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error('Expired access token', { cause: { status: 401, code: 'ACCESS_TOKEN_EXPIRED' } }));
    }
    return next(new Error('Invalid access token', { cause: { status: 401 } }));
  }
};

export default authenticate;
