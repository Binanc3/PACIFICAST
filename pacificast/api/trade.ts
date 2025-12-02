import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const API_KEY = process.env.PACIFICA_API_KEY; 
  const API_SECRET = process.env.PACIFICA_API_SECRET; 

  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ success: false, message: "API Keys missing" });
  }

  const payload = req.body;
  const timestamp = Date.now().toString();
  const stringifiedPayload = JSON.stringify(payload);
  const signaturePayload = timestamp + 'POST' + '/v1/order' + stringifiedPayload;
  
  const signature = crypto.createHmac('sha256', API_SECRET).update(signaturePayload).digest('hex');

  try {
    const response = await fetch('https://api.pacifica.fi/v1/order', {
      method: 'POST',
      headers: {
        'PF-API-KEY': API_KEY,
        'PF-API-TIMESTAMP': timestamp,
        'PF-API-SIGNATURE': signature,
        'Content-Type': 'application/json'
      },
      body: stringifiedPayload
    });
    const data = await response.json();
    return res.status(200).json({ success: true, ...data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}