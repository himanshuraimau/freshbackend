import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoute from './routes/userRoute.js';
import deviceRoutes from './routes/deviceRoute.js';
import deviceDataRoutes from './routes/deviceDataRoute.js';
import productRoutes from './routes/productRoutes.js';

const app = express();



app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'healthy' });
});

// API Routes with consistent versioning
app.use('/api/v1/users', userRoute);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/device-data', deviceDataRoutes);
app.use('/api/v1/products', productRoutes);

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