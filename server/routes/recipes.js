import express from 'express';
import { generateRecipes, getRecipeHistory } from '../controllers/recipeController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', auth, generateRecipes);
router.get('/history', auth, getRecipeHistory);

export default router;