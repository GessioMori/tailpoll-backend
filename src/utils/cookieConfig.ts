export const cookieConfig = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'prod',
  origin: process.env.FRONTEND_URL,
  signed: true,
} as const;
