import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import userRoute from './routes/userRoute.js'; // Import userRoute
import deviceRoutes from './routes/deviceRoute.js'; // Import deviceRoutes

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'healthy' });
});

// Routes
app.use('/api/v1/users', userRoute);
app.use('/api/devices', deviceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;