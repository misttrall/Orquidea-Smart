import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
// import { SerialPort, ReadlineParser } from "serialport"; // 🔄 Descomenta cuando uses el Arduino

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // carpeta del frontend

/* 🔹 CONEXIÓN A MARIADB (XAMPP) */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "orquidea_smart",
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error("❌ Error conectando a MariaDB:", err);
  } else {
    console.log("✅ Conectado a la base de datos orquidea_smart");
  }
});

/* =====================================================
   🧠 MODO SIMULADOR (sin Arduino)
   ===================================================== */
console.log("⚙️ Modo simulador activo: generando datos falsos cada 3s...");

setInterval(() => {
  const lectura = {
    humedad: Math.floor(Math.random() * 50) + 50,      // 50–100 %
    temperatura: (Math.random() * 10 + 20).toFixed(1), // 20–30 °C
    luminosidad: Math.floor(Math.random() * 60000) + 20000 // 20k–80k lx
  };

  // Enviar al frontend
  io.emit("lecturaArduino", lectura);
  console.log("📡 Datos simulados:", lectura);

  // Guardar en la base de datos
  const sql = "INSERT INTO registros (temperatura, humedad, fecha_hora) VALUES (?, ?, NOW())";
  db.query(sql, [lectura.temperatura, lectura.humedad], (err) => {
    if (err) console.error("❌ Error al insertar registro:", err);
    else console.log("💾 Registro simulado guardado en BD");
  });

}, 3000);

/* =====================================================
   🔄 MODO ARDUINO (descomentar al usar el dispositivo)
   ===================================================== */

/*
const portArduino = new SerialPort({
  path: "COM10", // ⚠️ cambia al puerto correcto (ej: COM5 o /dev/ttyUSB0)
  baudRate: 9600,
});
const parser = portArduino.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", (data) => {
  try {
    const lectura = JSON.parse(data.trim());
    const { temperatura, humedad, luminosidad } = lectura;

    console.log("📡 Datos desde Arduino:", lectura);

    // Enviar al frontend
    io.emit("lecturaArduino", lectura);

    // Guardar en la base de datos
    const sql = "INSERT INTO registros (temperatura, humedad, fecha_hora) VALUES (?, ?, NOW())";
    db.query(sql, [temperatura, humedad], (err) => {
      if (err) console.error("❌ Error al insertar registro:", err);
      else console.log("💾 Registro real guardado en BD");
    });

  } catch (err) {
    console.log("⚠️ Error procesando JSON:", data);
  }
});
*/

/* =====================================================
   🔹 RUTA API: obtener historial de registros
   ===================================================== */
app.get("/api/registros", (req, res) => {
  const sql = "SELECT * FROM registros ORDER BY fecha_hora DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener registros:", err);
      res.status(500).send("Error en el servidor");
    } else {
      res.json(results);
    }
  });
});

/* =====================================================
   🚀 INICIO DEL SERVIDOR
   ===================================================== */
const PORT = 3000;
server.listen(PORT, () => console.log(`🌸 Orquídea Smart corriendo en http://localhost:${PORT}`));
