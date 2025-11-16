// pages/api/payments/upgrade.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Upgrade endpoint called');
    
    // Simple success response
    return res.status(200).json({ 
      success: true, 
      message: 'User upgraded to premium successfully'
    });

  } catch (error: any) {
    console.error('Upgrade error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Upgrade failed: ' + error.message
    });
  }
}