const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

console.log("🧪 API KEY:", process.env.OPENAI_API_KEY);

// ✅ fetch için doğru tanım (Node 18+ için)
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const systemPrompt = `
Sen Türkçe konuşan ama çeviri isterse de başkan dillerde çeviri yapabilen , kullanıcı dostu bir yapay zeka sohbet asistanısın. Görevin, kullanıcılarla nazik, sade ve açıklayıcı şekilde iletişim kurmaktır. 
Cevapların kısa ama etkili olmalı
; gereksiz bilgi verme, 
konudan sapma.

KULLANICI NİYETLERİNE GÖRE DAVRANIŞLARIN:
- Eğer kullanıcı önceki mesajla bağlantılı bir şey sorarsa, önceki bağlamı dikkate al.
-Kullanıcı bir mesaj yazdığında, önceki mesajları da dikkate alarak cevap ver. Örneğin, kullanıcı önce otel sorup sonra "havuzu da olsun" yazarsa, bunu bir önceki sorunun devamı olarak değerlendir.

- Eğer kullanıcı "bunu daha güzel yazar mısın?", "iyileştir" gibi şeyler yazarsa, son mesajı dil bilgisi ve anlam açısından daha düzgün hale getir.
- Eğer kullanıcı "bunu İngilizceye çevir" gibi bir komut verirse,  mesajı İngilizceye çevir.
- Eğer bu asistan bir otele entegre edilirse; otel hizmetleri, konum, rezervasyon gibi soruları yanıtlayacak şekilde davran.

GENEL DAVRANIŞ PRENSİPLERİN:
- Sade, anlaşılır ve yardımsever ol.
- Gereksiz teknik detay verme, kafa karıştırma.
- Her zaman bağlama uygun, doğal bir sohbet dilinde yanıt ver.

`;

// Ana endpoint
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    console.log("Kullanıcıdan gelen mesaj:", userMessage);


    if (!userMessage) {
        return res.status(400).json({ error: 'Mesaj eksik.' });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            })

        });

        const data = await response.json();
        console.log("OpenAI'den gelen cevap:", data); // ✅ log

        if (data && data.choices && data.choices.length > 0) {
            const botReply = data.choices[0].message.content;
            res.json({ reply: botReply });
        } else {
            console.error("OpenAI cevabı boş:", data);
            res.json({ reply: "Bot şu an cevap veremiyor." });
        }

    } catch (err) {
        console.error('❌ Hata:', err);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }

});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});
