const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");
const typingIndicator = document.getElementById("typing-indicator");
const modelSelect = document.getElementById("model-select");

// Emoji butonu ve paneli seç
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");
const emojiCloseBtn = document.getElementById("emoji-close-btn");


let messageHistory = [];
const maxHistoryLength = 10;

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

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
    msgContent.textContent = content;

    const msgTime = document.createElement("div");
    msgTime.className = "message-time";
    msgTime.textContent = getCurrentTime();

    msgDiv.appendChild(msgContent);
    msgDiv.appendChild(msgTime);
    wrapper.appendChild(avatar);
    wrapper.appendChild(msgDiv);

    return wrapper;
}

function addMessage(content, isUser = false, delay = 0) {
    setTimeout(() => {
        const msgElement = createMessage(content, isUser);
        chatMessages.appendChild(msgElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, delay);
}

function showTypingIndicator() {
    typingIndicator.classList.add("show");
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.classList.remove("show");
}

function sendMessage() {
    const message = userInput.value.trim();
    if (!message) {
        userInput.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => { userInput.style.animation = ""; }, 500);
        return;
    }

    addMessage(message, true);
    showTypingIndicator();

    messageHistory.push({ sender: "user", message });
    if (messageHistory.length > maxHistoryLength) {
        messageHistory.shift();
    }

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
            hideTypingIndicator();
            const reply = data.reply || "Üzgünüm, cevap veremiyorum.";
            addMessage(reply, false, 500);

            messageHistory.push({ sender: "bot", message: reply });
            if (messageHistory.length > maxHistoryLength) {
                messageHistory.shift();
            }
        })
        .catch(err => {
            console.error("Hata oluştu:", err);
            hideTypingIndicator();
            addMessage("Bağlantı hatası. Lütfen tekrar deneyin.", false, 500);
        });

    userInput.value = "";
    sendBtn.style.transform = "scale(0.9) rotate(45deg)";
    setTimeout(() => { sendBtn.style.transform = ""; }, 200);
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener("input", (e) => {
    const length = e.target.value.length;
    sendBtn.style.background = length > 0
        ? "linear-gradient(135deg, #4ade80, #22d3ee)"
        : "linear-gradient(135deg, #667eea, #764ba2)";
});

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

// Basit örnek emojiler (istediğin kadar artırabilirsin)
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

function loadEmojis() {
    emojiGrid.innerHTML = "";
    emojis.forEach(e => {
        const btn = document.createElement("button");
        btn.classList.add("emoji-item");
        btn.textContent = e;
        btn.addEventListener("click", () => {
            userInput.value += e;   // Inputa ekle
            emojiPicker.classList.remove("show"); // Paneli kapat
        });
        emojiGrid.appendChild(btn);
    });
}

// Sayfa yüklenince emojileri doldur
loadEmojis();