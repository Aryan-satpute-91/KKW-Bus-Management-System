const express = require('express');
const dotenv  = require('dotenv');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
const dns     = require('dns');

// Force IPv4 resolution first for external service calls in Node 18+
dns.setDefaultResultOrder('ipv4first');

// Load env vars first
dotenv.config();

const app = express();

// CORS — supports multiple origins via comma-separated CLIENT_URL
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser (Postman, curl)
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/buses',       require('./routes/busRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/reports',     require('./routes/reportRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'KKW Bus MMS API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
  console.log('📦 Database/Auth provider: Firebase');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing process or set PORT to another value.`);
    process.exit(1);
  }
  throw err;
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
// Trigger nodemon restart
