// Gerekli DOM elementlerini al
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");
const typingIndicator = document.getElementById("typing-indicator");

// Mesaj oluşturma
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

// Mesajı ekle
function addMessage(content, isUser = false, delay = 0) {
    setTimeout(() => {
        const msgElement = createMessage(content, isUser);
        chatMessages.appendChild(msgElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, delay);
}

// Tiping indicator
function showTypingIndicator() {
    typingIndicator.classList.add("show");
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.classList.remove("show");
}

// Mesaj gönderme fonksiyonu
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) {
        userInput.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => { userInput.style.animation = ""; }, 500);
        return;
    }

    addMessage(message, true);
    showTypingIndicator();

    fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            hideTypingIndicator();
            const reply = data.reply || "Üzgünüm, cevap veremiyorum.";
            addMessage(reply, false, 500);
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

// Olay dinleyicileri
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

// Shake animasyon ve mesaj geçiş animasyonu
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
.message-wrapper {
    opacity: 0;
    animation: messageSlide 0.4s ease-out forwards;
}
@keyframes messageSlide {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);

const toggleBtn = document.getElementById("toggle-theme");
toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggleBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});
