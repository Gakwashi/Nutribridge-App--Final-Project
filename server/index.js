import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; 
// Comment out the route imports temporarily to isolate the issue
// import authRoutes from './routes/auth.js';
// import recipeRoutes from './routes/recipes.js';
// import paymentRoutes from './routes/payments.js';
// import forumRoutes from './routes/forum.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NutriBridge API!' });
});

// ✅ Health check endpoint to verify MongoDB connection
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    database: 'MongoDB',
    timestamp: new Date().toISOString()
  });
});

// Comment out these routes temporarily
// app.use('/api/auth', authRoutes);
// app.use('/api/recipes', recipeRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/forum', forumRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB environment: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
});