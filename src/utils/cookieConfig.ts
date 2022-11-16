export const cookieConfig = {
  httpOnly: false,
  sameSite: 'none',
  secure: true,
  origin: process.env.FRONTEND_URL,
  signed: true,
} as const;
