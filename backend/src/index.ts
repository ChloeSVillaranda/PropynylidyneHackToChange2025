import express from 'express';
// note: include .js so compiled ESM output resolves correctly under node16/nodenext
import authRoutes from './routes/auth.js';

const app = express();


app.use(express.json());
app.use('/api/auth', authRoutes);

export default app;