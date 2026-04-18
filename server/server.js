const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection (Supabase)
console.log('Usando Supabase como banco de dados');

// Routes (Supabase)
app.use('/api/auth', require('./routes/authSupabase'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/bookings', require('./routes/bookings'));
// app.use('/api/courts', require('./routes/courts'));
// app.use('/api/payments', require('./routes/payments'));

app.get('/', (req, res) => {
  res.json({ message: 'Quadra Futsal API - Online' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
