import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', auth, async (req, res) => {
  try {
    const { paymentMethod, region } = req.body;
    
    // Mock payment processing
    if (region.toLowerCase().includes('kenya') && paymentMethod === 'mpesa') {
      // Simulate M-Pesa payment
      res.json({ 
        success: true, 
        message: 'M-Pesa payment initiated',
        transactionId: 'MPESA_' + Date.now()
      });
    } else {
      // Simulate card payment
      res.json({ 
        success: true, 
        message: 'Card payment processed',
        transactionId: 'CARD_' + Date.now()
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upgrade', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Mock upgrade to premium
    const { error } = await supabase
      .from('users')
      .update({ is_premium: true })
      .eq('id', userId);

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Account upgraded to premium!',
      is_premium: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;