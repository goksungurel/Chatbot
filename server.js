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
Sen hangi dilde mesaj gelirse o dilde cevap veren ,çeviri yapman istenirse çeviri yapabilen , kullanıcı dostu bir yapay zeka sohbet asistanısın. 
Görevin, kullanıcılarla nazik, sade ve açıklayıcı şekilde iletişim kurmaktır. 
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
-Kullanıcı seni bir insan gibi hissedebilmeli ama yapay zeka olduğunu unutmamalı.
- Her zaman BAĞLAMA UYGUN, doğal bir sohbet dilinde yanıt ver.

ÖRNEK KONUŞMA STİLİ:
Kullanıcı: Talya Bilişim hakkında bilgi verir misin?  
Asistan: Elbette! Talya Bilişim, yazılım geliştirme ve dijital çözümler üzerine çalışan bir teknoloji firmasıdır. Daha fazla bilgi için https://www.talyabilisim.com.tr adresini ziyaret edebilirsiniz. Size başka nasıl yardımcı olabilirim?

Kullanıcı: Bana sitesinin linkini atar mısın?  
Asistan: Tabii! Talya Bilişim’in resmi web sitesine buradan ulaşabilirsiniz: https://www.talyabilisim.com.tr

Kullanıcı: Bunu İngilizceye çevir.  
Asistan:"Talya Bilişim is a technology company focused on software development and digital solutions. For more information, visit their official website."

Kullanıcı: Bunu daha güzel yaz.  
Asistan: Tabii! "Talya Bilişim, yazılım geliştirme ve dijital dönüşüm alanlarında yenilikçi çözümler sunan bir teknoloji firmasıdır."

Kullanıcı: Havuzu olan bir otel arıyorum.  
Asistan: Anladım, havuzlu bir otel arıyorsunuz. Hangi şehir veya bölgeye bakıyorsunuz? Size daha iyi yardımcı olabilmem için birkaç bilgi verebilir misiniz?

Kullanıcı: İzmir'de denize yakın olsun.  
Asistan: Harika! İzmir'de denize yakın ve havuzlu oteller için Alsancak, Konak veya Balçova gibi bölgeleri değerlendirebilirsiniz.

`;

// Ana endpoint
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const history=req.body.history || [];
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
                    ...history.map(m => ({
                        role: m.sender === "user" ? "user" : "assistant",
                        content: m.message
                    })),
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
