const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/immigration_ai'
});

// Connect to database
client.connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Immigration AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test account number generation
app.get('/test-account', async (req, res) => {
  try {
    // Generate account number
    const firstName = 'Mary';
    const namePrefix = firstName.substring(0, 2).toUpperCase();
    const randomNumber = Math.floor(10000 + Math.random() * 90000);
    const accountNumber = `${namePrefix}${randomNumber}`;
    
    res.json({
      success: true,
      accountNumber,
      message: 'Account number generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test database query
app.get('/test-db', async (req, res) => {
  try {
    const result = await client.query('SELECT 1 as test');
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Database query successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test account: http://localhost:${PORT}/test-account`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/test-db`);
});





