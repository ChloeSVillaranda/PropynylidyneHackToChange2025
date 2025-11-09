import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from './usersService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateUser = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  
  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign(
    { 
      email: user.email,
      name: user.fullName,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  };
};
