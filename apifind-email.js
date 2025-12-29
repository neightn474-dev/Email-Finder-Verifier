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
    const { fullName, domain } = req.body;
    
    if (!fullName || !domain) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    // Generate email patterns
    const nameParts = fullName.trim().split(' ');
    const first = nameParts[0].toLowerCase();
    const last = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : first;
    
    const patterns = [
      `${first}.${last}@${domain}`,
      `${first}${last}@${domain}`,
      `${first}@${domain}`
    ];
    
    // Simulate verification (random for demo)
    const randomScore = Math.random();
    const selectedEmail = patterns[0];
    
    if (randomScore > 0.6) {
      return res.status(200).json({
        success: true,
        email: selectedEmail,
        confidence: 90,
        message: 'Email found and verified'
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'Could not verify email',
        confidence: 0
      });
    }
    
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}