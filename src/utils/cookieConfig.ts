import { CookieOptions } from 'express';

export const cookieConfig = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  origin: process.env.FRONTEND_URL,
  signed: true,
  maxAge: 2147483647,
} as CookieOptions;
