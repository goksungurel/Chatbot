const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");

sendBtn.addEventListener("click", () => {
    const message = userInput.value.trim();
    if (message) {
        const userMsg = document.createElement("div");
        userMsg.className = "user-message";
        userMsg.textContent = message;
        chatMessages.appendChild(userMsg);

        fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        })
            .then(res => res.json())
            .then(data => {
                const botMsg = document.createElement("div");
                botMsg.className = "bot-message";
                botMsg.textContent = data.reply;
                chatMessages.appendChild(botMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(err => {
                console.error(err);
            });

        userInput.value = "";
    }
});
