export const cookieConfig = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  origin: process.env.FRONTEND_URL,
  signed: true,
} as const;
