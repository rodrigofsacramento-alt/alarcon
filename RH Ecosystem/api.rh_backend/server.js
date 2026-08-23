import express from 'express';
import cors from 'cors';
import config from './config.js';
import questionsRouter from './routes/questions.js';
import assessmentsRouter from './routes/assessments.js';
import resultsRouter from './routes/results.js';
import authRouter from './routes/auth.js';

const app = express();

// Middleware
app.use(cors({ origin: config.cors.origins, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/v1', authRouter);
app.use('/api/v1', questionsRouter);
app.use('/api/v1', assessmentsRouter);
app.use('/api/v1', resultsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

app.get('/', (req, res) => {
  res.json({ message: 'API de Análise Comportamental v1.0' });
});

// Start
app.listen(config.app.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.app.port}`);
  console.log(`📚 API Docs: http://localhost:${config.app.port}/api/v1`);
});

export default app;
