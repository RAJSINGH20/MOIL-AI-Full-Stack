import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import helmet from 'helmet'; import morgan from 'morgan'; import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js'; import dataRoutes from './routes/data.routes.js'; import analyticsRoutes from './routes/analytics.routes.js';

const app = express();
app.use(helmet()); app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(x => x.trim()) : ['http://localhost:5173', 'http://127.0.0.1:5173'] })); app.use(express.json({ limit: '2mb' })); app.use(morgan('dev')); app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'MOIL AI Backend', time: new Date() }));
app.use('/api/data', dataRoutes); app.use('/api/analytics', analyticsRoutes);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
const port = process.env.PORT || 3000;
connectDB().then(() => app.listen(port, () => console.log(`Server running on ${port}`))).catch(() => {
  console.error('Backend startup stopped because the database connection failed.');
  process.exit(1);
});
