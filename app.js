require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();

// ======================
sequelize.sync({ alter: true })
  .then(() => console.log('✅ MySQL connected via Sequelize'))
  .catch(err => console.error('❌ Sequelize connection error:', err));

// ======================
// Middleware
// ======================
app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ======================
// Routes (API)
// ======================
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ======================
// 404 handler
// ======================
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ======================
// Start server
// ======================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 API server started on http://localhost:${PORT}`));
