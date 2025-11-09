import express from 'express';
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../config/aws.js";
import jwt from 'jsonwebtoken';

const router = express.Router();
const USERS_TABLE = process.env.USERS_TABLE || 'users';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Attempting login for:', email);

    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { email }
    });

    const response = await docClient.send(command);
    const user = response.Item;

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For testing, compare exact passwords
    if (password !== user.password) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: user.email, role: 'admin' },
      process.env.JWT_SECRET || 'default-secret'
    );

    console.log('Login successful for:', email);
    res.json({
      token,
      user: {
        email: user.email,
        role: 'admin',
        name: 'Bob Marley'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
