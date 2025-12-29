export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // Basic validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      return res.status(200).json({
        success: false,
        email: email,
        confidence: 0,
        message: 'Invalid email syntax'
      });
    }
    
    // Simulate verification
    const randomScore = Math.random();
    
    if (randomScore > 0.65) {
      return res.status(200).json({
        success: true,
        email: email,
        confidence: 90,
        message: 'Mailbox exists'
      });
    } else {
      return res.status(200).json({
        success: false,
        email: email,
        confidence: 30,
        message: 'Mailbox not found'
      });
    }
    
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}