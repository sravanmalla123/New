const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');

const authRoutes = require('./routes/auth');
const villageRoutes = require('./routes/villages');
const imageRoutes = require('./routes/images');
const applicationRoutes = require('./routes/applications');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Adarsh Gram Portal API is running', timestamp: new Date().toISOString() });
});

// 404
app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start with async DB init (sql.js needs to load WASM)
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`\n🏛️  Adarsh Gram Development Portal`);
      console.log(`🚀 Backend API: http://localhost:${PORT}/api`);
      console.log(`📁 Uploads:    http://localhost:${PORT}/uploads\n`);
      console.log(`📧 Admin:   admin@adarshgram.gov.in  /  Admin@123`);
      console.log(`🏫 College: iitb@adarshgram.gov.in   /  College@123\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
