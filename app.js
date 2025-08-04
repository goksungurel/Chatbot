//HTML öğelerini seçiyoruz
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");
const typingIndicator = document.getElementById("typing-indicator");
const modelSelect = document.getElementById("model-select");

// Emoji butonu ve paneli seç
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");
const emojiCloseBtn = document.getElementById("emoji-close-btn");

//Mesaj geçmişi için bir dizi oluşturuyoruz,maxHistoryLength ile geçmişin uzunluğunu sınırlıyoruz
let messageHistory = [];
const maxHistoryLength = 10;

//saat gösteren fonksiyon
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
//mesaj oluşturma fonk
function createMessage(content, isUser = false) {
    const wrapper = document.createElement("div");
    wrapper.className = isUser ? "message-wrapper user-wrapper" : "message-wrapper bot-wrapper";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const msgDiv = document.createElement("div");
    msgDiv.className = isUser ? "user-message" : "bot-message";

    const msgContent = document.createElement("div");
    msgContent.className = "message-content";
    msgContent.textContent = content; //mesajın içeriği olabilir

    const msgTime = document.createElement("div");
    msgTime.className = "message-time";
    msgTime.textContent = getCurrentTime(); //mesaajın saati

    msgDiv.appendChild(msgContent);
    msgDiv.appendChild(msgTime);
    wrapper.appendChild(avatar);
    wrapper.appendChild(msgDiv);

    return wrapper; //mesaj elemenletini döndürüyoruz
}
//mesaj eklemek için kullanılan fonksiyon
function addMessage(content, isUser = false, delay = 0) {
    setTimeout(() => {
        const msgElement = createMessage(content, isUser);
        chatMessages.appendChild(msgElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, delay);
}

//yazma göstergesini gösteren fonksiyon
function showTypingIndicator() {
    typingIndicator.classList.add("show");// "show" sınıfını ekleyerek gösterebiliriz
    chatMessages.scrollTop = chatMessages.scrollHeight; //Sohbet penceresini kaydırıyoruz
}

//Yazma göstergesini gizleyen fonksiyon
function hideTypingIndicator() {
    typingIndicator.classList.remove("show"); //show sınıfını kaldırıyoruz
}

function sendMessage() {
    const message = userInput.value.trim(); //Kullanıcıdan gelen mesajı alıyoruz
    if (!message) {
        userInput.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => { userInput.style.animation = ""; }, 500);
        return;
    }

    addMessage(message, true); //kullanıcı mesajını ekle
    showTypingIndicator(); //yazma göstergesini göster

    messageHistory.push({ sender: "user", message }); //mesajı geçmişe ekliyoruz
    if (messageHistory.length > maxHistoryLength) { //geçmişin uzunkupunu kontrol et
        messageHistory.shift(); //eğer fazla mesaj varsa ilkini sil
    }

    //frontend (tarafında Node.js backend’ine POST isteği atan kısım.

    fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message,
            history: messageHistory,
            model: modelSelect.value
        })
    })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            hideTypingIndicator(); //yazma göstergesini gizle
            const reply = data.reply || "Üzgünüm, cevap veremiyorum."; //bot cevabı
            addMessage(reply, false, 500);

            messageHistory.push({ sender: "bot", message: reply }); //bot mesajını geçmişe ekle
            if (messageHistory.length > maxHistoryLength) {
                messageHistory.shift();
            }
        })
        .catch(err => {
            console.error("Hata oluştu:", err);
            hideTypingIndicator();
            addMessage("Bağlantı hatası. Lütfen tekrar deneyin.", false, 500);
        });

    userInput.value = "";  //Input alanını temizle
    sendBtn.style.transform = "scale(0.9) rotate(45deg)";  // Gönder butonuna animasyon ekle
    setTimeout(() => { sendBtn.style.transform = ""; }, 200); // 200 ms sonra animasyonu kaldır
}

//Gönder butonuna tıklanınca mesaj gönder
sendBtn.addEventListener("click", sendMessage);
//enter tuşuna basıldığında da mesaj gönder
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

//Input alanında yazı yazıldıkça butonun rengini değiştiriyoruz
userInput.addEventListener("input", (e) => {
    const length = e.target.value.length;
    sendBtn.style.background = length > 0
        ? "linear-gradient(135deg, #4ade80, #22d3ee)" //mesaj varsa yeşil renk
        : "linear-gradient(135deg, #667eea, #764ba2)"; //mesaj yoksa mor renk
});

//Tema değiştirme butonuna tıklayınca sayfanın teması değiştiriyoruz
const toggleBtn = document.getElementById("toggle-theme");
toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggleBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});
// Emoji panelini aç/kapat
emojiBtn.addEventListener("click", () => {
    emojiPicker.classList.toggle("show"); // CSS'teki .show class'ı paneli gösterir
});

// Kapat butonu
emojiCloseBtn.addEventListener("click", () => {
    emojiPicker.classList.remove("show");
});

// Basit örnek emojiler
const emojiGrid = document.getElementById("emoji-grid");
const emojis = [
    // 😀 Yüz ifadeleri
    "😀","😁","😂","🤣","😎","😍","😘","😜","🤔","😢","😡",

    // 👍 Jestler
    "👍","🙏","👋","🤚","👌","🤌","🤏","🤞","🤘","🤙",
    "👈","👉","👆","👇","👎",

    // ❤️ Kalpler & Kutlamalar
    "🔥","🎉","❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎",
    "💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","💌"
];
//emoji butonlarını ekliyoruz
function loadEmojis() {
    emojiGrid.innerHTML = ""; //emojileri sıfırla
    emojis.forEach(e => {
        const btn = document.createElement("button"); //yeni bir buton oluştur
        btn.classList.add("emoji-item"); //emojiyi buton olarak ekle
        btn.textContent = e;
        btn.addEventListener("click", () => {
            userInput.value += e;    // Seçilen emoji inputa eklenir
            emojiPicker.classList.remove("show"); // Paneli kapat
        });
        emojiGrid.appendChild(btn);
    });
}

// Sayfa yüklenince emojileri doldur
loadEmojis();