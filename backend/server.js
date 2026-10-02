const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, getDBMode } = require('./config/db.js');
const { initSocket } = require('./services/socketService.js');
const errorHandler = require('./middleware/errorHandler.js');
const { apiLimiter } = require('./middleware/rateLimiter.js');

// Import Routes
const authRoutes = require('./routes/authRoutes.js');
const bugRoutes = require('./routes/bugRoutes.js');
const commentRoutes = require('./routes/commentRoutes.js');
const aiRoutes = require('./routes/aiRoutes.js');
const analyticsRoutes = require('./routes/analyticsRoutes.js');
const userRoutes = require('./routes/userRoutes.js');

const { seedDB } = require('./seeders/seedData.js');

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
initSocket(server);

// Connect Database
connectDB().then(() => {
  const { isInMemoryMode } = getDBMode();
  if (isInMemoryMode) {
    console.log('[Server] In-Memory Fallback Active: Pre-populating demo data...');
    seedDB();
  }
});

// Middleware setup
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(mongoSanitize());
app.use('/api', apiLimiter);

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Healthcheck Route
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Bug Tracking Automation System API',
    timestamp: new Date().toISOString(),
    mode: getDBMode().isInMemoryMode ? 'In-Memory Demo Mode' : 'MongoDB Production Mode',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Bug Tracking System API running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});
