const axios = require('axios');

async function sendToWhatsApp(userId, message) {
  const url = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;

  const payload = {
    to: userId,
    message: message
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log('✅ WhatsApp message sent:', response.data);
  } catch (error) {
    console.error('❌ WhatsApp send failed:', error.response?.data || error.message);
  }
}

module.exports = { sendToWhatsApp };
