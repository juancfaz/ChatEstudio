const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// Configurar cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Ruta POST para recibir mensajes y responder con Gemini
app.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        // Prompt para orientar la respuesta académica
        const prompt = `
        Eres ChatEstudio, un tutor virtual para estudiantes de preparatoria y universidad.
        Tu misión es explicar de forma clara, paciente y paso a paso.
        Materias principales: Matemáticas, Inglés y Programación.
        
        Pregunta del estudiante: ${userMessage}
        `;

        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        res.json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Ocurrió un error al procesar tu pregunta." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
