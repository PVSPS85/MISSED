import express from 'express';
import cors from 'cors';
import analysisRoutes from './routes/analysis';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Support large conversation text

// Routes
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MISSED. Local Backend is running.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MISSED. Backend running on http://localhost:${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`- POST /api/analysis/submit`);
  console.log(`- GET  /api/analysis/status/:jobId`);
  console.log(`- GET  /api/analysis/result/:jobId`);
  console.log(`- DEL  /api/analysis/purge`);
});
