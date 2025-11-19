import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// Conexión a MySQL
// ==========================
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "orquidea_smart",
});

// ==========================
// Inicializar tablas
// ==========================
async function inicializarTablas() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS riegos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        evento VARCHAR(50) NOT NULL,
        valor FLOAT NOT NULL,
        temperatura FLOAT NOT NULL,
        humedad FLOAT NOT NULL,
        fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tablas inicializadas correctamente");
  } catch (error) {
    console.error("❌ Error inicializando tablas:", error);
  }
}
await inicializarTablas();

// ==========================
// Variables simuladas
// ==========================
let temperatura = 20; // valor inicial aproximado
let humedad = 50;     // valor inicial aproximado

// ==========================
// Función para emitir y guardar registro
// ==========================
async function crearRegistro(evento, valor, temp, hum) {
  const [result] = await pool.query(
    "INSERT INTO riegos (evento, valor, temperatura, humedad) VALUES (?, ?, ?, ?)",
    [evento, valor, temp, hum]
  );

  const [rows] = await pool.query(
    "SELECT * FROM riegos WHERE id = ?",
    [result.insertId]
  );

  const registro = rows[0];
  io.emit("nuevoRegistroCliente", registro);
}

// ==========================
// Función para obtener datos de Open-Meteo
// ==========================
async function obtenerDatosClima() {
  try {
    const lat = -34.4063;
    const lon = -70.8583;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relative_humidity_2m`;

    const { data } = await axios.get(url);
    if (!data || !data.current_weather) return null;

    // Ajuste: temperatura de Open-Meteo
    temperatura = data.current_weather.temperature;
    // Simulación simple: humedad base + un valor aleatorio
    humedad = 50 + Math.random() * 10;

    return { temperatura, humedad };
  } catch (error) {
    console.error("❌ Error obteniendo clima:", error);
    return null;
  }
}

// ==========================
// Lectura automática cada 50s
// ==========================
setInterval(async () => {
  const clima = await obtenerDatosClima();
  if (!clima) return;

  temperatura = clima.temperatura;
  humedad = clima.humedad;

  await crearRegistro("Lectura automática", 0, temperatura, humedad);
}, 10000);

// ==========================
// WebSocket para riego manual
// ==========================
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado");

  socket.on("regarPlanta", async () => {
    console.log("💧 Riego manual solicitado");

    const pasos = 10;
    const tempObjetivo = 14;          // temperatura baja a ~14°C
    const humObjetivo = Math.min(humedad + 30, 100); // humedad sube

    for (let i = 0; i < pasos; i++) {
      humedad += (humObjetivo - humedad)/(pasos - i);
      temperatura -= (temperatura - tempObjetivo)/(pasos - i);
      if (humedad > 100) humedad = 100;
      if (temperatura < 14) temperatura = 14;

      // Emitir a todos los clientes los cambios de humedad y temperatura
      io.emit("lecturaClima", { temperatura, humedad });

      await crearRegistro("Riego manual", 0, temperatura, humedad);
      await new Promise(r => setTimeout(r, 300));
    }

    // Gradualmente vuelve a valores de Open-Meteo
    for (let i = 0; i < pasos; i++) {
      const clima = await obtenerDatosClima();
      if (!clima) continue;

      temperatura += (clima.temperatura - temperatura)/(pasos - i);
      humedad += (clima.humedad - humedad)/(pasos - i);

      io.emit("lecturaClima", { temperatura, humedad });
      await crearRegistro("Riego manual recuperación", 0, temperatura, humedad);
      await new Promise(r => setTimeout(r, 300));
    }
  });

  socket.on("disconnect", () => console.log("🔌 Cliente desconectado"));
});

// ==========================
// API: Listar registros
// ==========================
app.get("/api/registros", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM riegos ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error obteniendo registros:", error);
    res.status(500).json({ error: "Error al obtener registros" });
  }
});

// ==========================
// Servir index
// ==========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==========================
// Iniciar servidor
// ==========================
const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`));
