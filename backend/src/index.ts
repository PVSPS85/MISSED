import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import analysisRoutes from './routes/analysis';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Support large conversation text

// Routes
app.use('/api', analysisRoutes); // We'll mount all analysis routes on /api directly to have /api/analyze

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MISSED. Local Backend is running.' });
});

// Start server bound to localhost only
app.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`🚀 MISSED. Backend running on http://127.0.0.1:${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`- GET  /api/health`);
  console.log(`- POST /api/analyze`);
  console.log(`- POST /api/chat`);
  console.log(`- GET  /api/status/:jobId`);
  console.log(`- GET  /api/result/:jobId`);
  console.log(`- DEL  /api/purge`);
});
