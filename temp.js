//✅ WhatsApp message sent: { status: 'error', message: 'Invalid token' }

const axios = require('axios');

async function sendToWhatsApp(userId, message) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: userId,
    type: 'text',
    text: {
      body: message
    }
  };

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log('✅ Message sent to WhatsApp:', response.data);
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error.response?.data || error.message);
  }
}

// Required .env Variables
// Make sure your .env file includes:
WHATSAPP_API_KEY=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id


// Test It
// Once this function is in place:

// Your /webhook route will call it automatically

// Send a message from WhatsApp

// You should receive a GPT-generated reply

// Let me know when you’ve added this — I’ll help you test it live or troubleshoot any delivery issues. You're one step away from full deployment!












// //WEBHOOK ROUTE FOR TESTING OPENAI API
// app.post('/webhook', async (req, res) => {
//   try {
//     const userMessage = req.body.message;
//     const clientId = req.body.client_id || 'default';
//     const userId = req.body.user_id;

//     // For now, just use a basic prompt
//     const prompt = `User asked: "${userMessage}"`;

//     // Call OpenAI
//     const reply = await askOpenAI(prompt);

//     // Send reply to WhatsApp (placeholder)
//     console.log(`Reply to ${userId}: ${reply}`);

//     res.sendStatus(200);
//   } catch (error) {
//     console.error('Error in webhook:', error.message);
//     res.sendStatus(500);
//   }
// });












