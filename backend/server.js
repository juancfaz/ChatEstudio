// server.js
const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./database/db.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "clave_secreta_local";

app.use(express.json());
app.use(express.static("public"));

// Configurar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Registro
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Faltan datos" });
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hash]);
    res.json({ message: "Usuario registrado" });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Usuario ya existe" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Faltan datos" });
  try {
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
      if (err || !user) return res.status(401).json({ error: "Usuario no encontrado" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: "1h" });
      res.json({ token });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error interno" });
  }
});

// Middleware de autenticación
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No autorizado" });

  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, SECRET);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// Chat con Gemini
app.post("/api/chat", authMiddleware, async (req, res) => {
  try {
    const { message, subject, mode } = req.body;

    const modeText = mode === "resumen"
      ? "Responde de forma breve y directa, resaltando los puntos clave."
      : mode === "ejercicio"
      ? "Genera 3 ejercicios prácticos relacionados con la pregunta, con la dificultad adaptada a un estudiante de preparatoria/universidad. No des la respuesta, solo los enunciados."
      : "Explica paso a paso de forma detallada, usando ejemplos cuando sea posible.";

    const prompt = `
Eres ChatEstudio, un tutor virtual para estudiantes de preparatoria y universidad.
Materia seleccionada: ${subject}.
Modo de respuesta: ${mode}.

Si la pregunta no pertenece claramente a la materia seleccionada, indica que el usuario debe seleccionar la materia correcta.

${modeText}

Pregunta del estudiante: ${message}
    `;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    await db.run(
      "INSERT INTO chat_history (user_id, subject, question, answer) VALUES (?, ?, ?, ?)",
      [req.user.id, subject, message, reply]
    );

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Ocurrió un error al procesar tu pregunta." });
  }
});


// Obtener historial
app.get("/api/history", authMiddleware, async (req, res) => {
  db.all(
    "SELECT id, subject, question, answer, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC",
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al obtener historial" });
      }
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
