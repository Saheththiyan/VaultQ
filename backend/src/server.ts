import 'reflect-metadata';
import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectWithRetry } from './config/database';
import { socketService } from './sockets/socketService';
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import questionRoutes from './routes/questionRoutes';
import publicRoutes from './routes/publicRoutes';

const app = express();
const httpServer = http.createServer(app);

app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/api/admin', authRoutes);
app.use('/api/admin/events', eventRoutes);
app.use('/api/admin/questions', questionRoutes);
app.use('/api/events', publicRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = parseInt(process.env.PORT || '4000');

(async () => {
    await connectWithRetry();
    socketService.initialize(httpServer);
    httpServer.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
})();

export default app;
