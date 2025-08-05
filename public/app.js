const chat = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("message");

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    const message = messageInput.value;

    // Mostrar mensaje del usuario
    addMessage("Tú", message, "user");

    // Enviar mensaje al servidor
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
    });

    const data = await res.json();

    // Mostrar respuesta del bot
    addMessage("ChatEstudio", data.reply, "bot");

    messageInput.value = "";
});

function addMessage(sender, text, className) {
    const div = document.createElement("div");
    div.classList.add("message", className);
    div.textContent = `${sender}: ${text}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}
