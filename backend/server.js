import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';


//Routes
import bookRoutes from './routes/bookRoutes.js';
import userroutes from './routes/userroutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import staffRoutes from './routes/staffRoutes.js';

// Security Middleware
import { setSecurityHeaders } from './middleware/securityHeaders.js';

dotenv.config();

const app = express();

// Apply security headers globally
app.use(setSecurityHeaders);

// Request body size limits to prevent DoS attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Allow network access from any origin during development
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.21.244:5173",  // Without trailing slash
    "http://192.168.21.244:5173/"  // With trailing slash
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api', bookRoutes)
app.use('/api', userroutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api', staffRoutes)

//app.use('/api', userRouts)

//app.use('/api', paymentRoutes)


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
  console.log(`Server also accessible on network via your IP:${process.env.PORT}`);
});