import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import paymentRoutes from './routes/payments.js';
import forumRoutes from './routes/forum.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/forum', forumRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});