// backend/server.js
const express = require("express");
const app = express();
const PORT = 3000;

// Middleware para manejar JSON
app.use(express.json());
app.use(express.static("public"));


// Ruta inicial de prueba
app.get("/", (req, res) => {
    res.send("Servidor de ChatEstudio funcionando 🚀");
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
