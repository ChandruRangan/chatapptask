import jwt from 'jsonwebtoken';

export const generateToken = (userId: number): string => {
  const secretKey = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign({ userId }, secretKey, { expiresIn: '24h' });
};

export const verifyToken = (token: string): any => {
  const secretKey = process.env.JWT_SECRET || 'your_jwt_secret';
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
};
