import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import platformRoutes from './routes/platformRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Behind Vercel and Render, the real visitor address is in a header.
// TRUST_PROXY_HOPS says how many addresses from the right to skip. You will check it in Step 11.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || 1);
}

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'WorkNest API is running' });
});

// TEMPORARY: used once in Step 11 to check the rate limiter sees your real address. Delete it afterwards.
app.get('/api/debug-ip', (req, res) => {
  res.json({ ip: req.ip, forwardedFor: req.headers['x-forwarded-for'] });
});

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teams', teamRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});