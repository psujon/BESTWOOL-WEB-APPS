const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Cache Prevention Middleware for API ---
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// --- Mount Modular Router Modules ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/styles', require('./routes/styles'));
app.use('/api/processes', require('./routes/processes'));
app.use('/api/piece-rates', require('./routes/pieceRates'));
app.use('/api/buyer-orders', require('./routes/buyerOrders'));
app.use('/api/yarn-challans', require('./routes/yarnChallans'));
app.use('/api/production', require('./routes/production'));
app.use('/api/users', require('./routes/users'));
app.use('/api/backup', require('./routes/backups'));
app.use('/api/sections', require('./routes/sections'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/blocks', require('./routes/blocks'));
app.use('/api/colors', require('./routes/colors'));
app.use('/api/company', require('./routes/company'));
app.use('/api/units', require('./routes/units'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/reports', require('./routes/reports'));



// --- Frontend Static Servicing in Production ---
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Fallback to React SPA index.html for non-API client routes
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Garments Dashboard Server running on http://0.0.0.0:${PORT}`);
});
