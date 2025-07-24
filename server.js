const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static('src'));

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    console.log(`Kullanıcı mesajı: ${userMessage}`);

    // DUMMY cevap
    const botReply = `Merhaba! Şu anda demo modundayım. Bana '${userMessage}' dedin, bunu anladım.`;

    res.json({ reply: botReply });
});

app.listen(3000, () => {
    console.log("✅ Sunucu çalışıyor: http://localhost:3000 (DUMMY MODU)");
});
