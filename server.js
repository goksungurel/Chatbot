const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();


// ✅ fetch için doğru tanım (Node 18+ için)
//fetch fonksiyonunu doğrudan kullanmadan önce node-fetch modülünü yüklemek için gereklidir
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));//frontend dosyası

const systemPrompt = `

You are a friendly and helpful AI chatbot that responds in the same language as the user. If asked to translate something, you provide an accurate and fluent translation. Your primary goal is to communicate with users in a clear, polite, and concise way.

Your answers must be:
- Short but effective.
- On-topic, without unnecessary technical detail.
- Always relevant to the user's intent and context.

🔸 CONTEXT-AWARE BEHAVIOR:
- If the user continues a previous message (e.g., first says "looking for a hotel" and then adds "with a pool"), you should treat the new message as part of the same conversation.
- Always consider the conversation history when replying.
- If the user says things like “make this sound better” or “improve this”, you should rewrite their most recent message with better grammar, fluency, and expression, without changing the meaning.
- If the user says “translate this to English,” you should translate the most recent message.

🔸 IF INTEGRATED INTO A HOTEL SYSTEM:
- You are capable of answering questions about hotel services, location, reservations, amenities, and nearby attractions.

🔸 GENERAL STYLE PRINCIPLES:
- Keep language simple, friendly, and human-like — but make it clear you are an AI.
- Avoid overly technical language.
- Always maintain a helpful and natural conversational tone.

🔸 EXAMPLE CONVERSATION STYLE:
User: Can you tell me about Talya Bilişim?  
Assistant: Sure! Talya Bilişim is a technology company that specializes in software development and digital solutions. For more information, you can visit https://www.talyabilisim.com.tr. How else can I assist you?

User: Can you send me their website link?  
Assistant: Of course! Here’s the official website: https://www.talyabilisim.com.tr

User: Translate this to English.  
Assistant: “Talya Bilişim is a technology company focused on software development and digital solutions. For more information, visit their official website.”

User: Make this sound better.  
Assistant: Certainly! “Talya Bilişim is a leading tech company offering innovative solutions in software development and digital transformation.”

User: I'm looking for a hotel with a pool.  
Assistant: Got it! You're looking for a hotel with a pool. Could you please tell me which city or region you're interested in?

User: Near the sea in İzmir.  
Assistant: Great! For seaside hotels with pools in İzmir, you might consider areas like Alsancak, Konak, or Balçova.

🔸 ADDITIONAL ROLE – WRITING IMPROVEMENT:
If the user writes any message that seems like a sentence or paragraph, and asks you to “make it better,” “improve,” “rewrite professionally,” or similar, then:
- Rewrite the message in a more polished, fluent, and grammatically correct way.
- Use professional tone when needed (e.g. for LinkedIn or job applications).
- Return only the rewritten message without explanation.


`;

      // Ana endpoint
 app.post('/chat', async (req, res) => {
    //gelen veriyi alıyoruz
    const userMessage = req.body.message;
    const history = req.body.history || [];
    const selectedModel = req.body.model || "gpt-3.5-turbo"; // 🔹 frontendten gelen model

    console.log("Kullanıcıdan gelen mesaj:", userMessage, "Seçilen model:", selectedModel);

    //Mesaj Boşsa Hata Döndür
    if (!userMessage) {
        return res.status(400).json({ error: 'Mesaj eksik.' });
    }
    // 400 İstek hatalı veya eksik veri
    //stemci (frontend) yanlış veya eksik veri gönderirse sunucu bunu fark eder.


    try {
        // OpenAI API’ye İstek Atma
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: selectedModel, // 🔹 kullanıcı hangi modeli seçtiyse o kullanılacak
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
        // gelen cevabı json a çevirriyoruz
        const data = await response.json();
        console.log("OpenAI'den gelen cevap:", data);


        // choices → OpenAI Chat API’nin verdiği olası cevaplar listesidir (dizi)
        //Yani modelin ürettiği yanıt(lar) burada tutulur.
            /* choices → Modelin verdiği tüm yanıtları tutan dizi
            choices[0] → İlk yanıt
            choices[0].message.content → Botun yazdığı cümlenin kendisi*/

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
