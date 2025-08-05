const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const authSection = document.getElementById("authSection");
const chatSection = document.getElementById("chatSection");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const subjectSelect = document.getElementById("subject");
const modeSelect = document.getElementById("mode");
const chatDiv = document.getElementById("chat");
const historyDiv = document.getElementById("history");
const logoutBtn = document.getElementById("logoutBtn");

let token = null;

// Agregar mensajes al chat con formato
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("chat-message");
  msg.classList.add(sender === "user" ? "user" : "bot");
  msg.textContent = text;
  chatDiv.appendChild(msg);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

// Mostrar chat tras login
function showChat() {
  authSection.style.display = "none";
  chatSection.style.display = "block";
  loadHistory();
}

// Mostrar login/registro tras logout
function showAuth() {
  authSection.style.display = "block";
  chatSection.style.display = "none";
  chatDiv.innerHTML = "";
  historyDiv.innerHTML = "";
  token = null;
}

// Registro
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  alert(data.message || data.error);
  if (data.message) {
    registerForm.reset();
  }
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.token) {
    token = data.token;
    alert("Login exitoso!");
    showChat();
  } else {
    alert(data.error);
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  showAuth();
  alert("Sesión cerrada.");
});

// Enviar mensaje al chat
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!token) {
    alert("Debes iniciar sesión primero.");
    return;
  }

  const message = messageInput.value.trim();
  const subject = subjectSelect.value;
  const mode = modeSelect.value;

  if (!message) return;

  addMessage("user", `[${subject}] ${message}`);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, subject, mode }),
  });

  const data = await res.json();
  addMessage("bot", data.reply);

  messageInput.value = "";
});

// Cargar historial
async function loadHistory() {
  if (!token) return;

  const res = await fetch("/api/history", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  historyDiv.innerHTML = "";

  if (!data.length) {
    historyDiv.innerHTML = "<p>No hay historial guardado.</p>";
    return;
  }

  data.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <b>${item.subject}</b> - <i>${new Date(item.timestamp).toLocaleString()}</i><br/>
      <b>Pregunta:</b> ${item.question} <br/>
      <b>Respuesta:</b> ${item.answer} <hr/>
    `;
    historyDiv.appendChild(div);
  });
}

// Inicial
showAuth();
