const chat = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("message");

const subjectSelect = document.getElementById("subject");

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = messageInput.value;
    const subject = subjectSelect.value;

    addMessage("Tú", `[${subject}] ${message}`, "user");

    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, subject })
    });

    const data = await res.json();
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
