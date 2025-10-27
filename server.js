import express from "express";
import nodemailer from "nodemailer";
import twilio from "twilio";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// --- CONFIGURACIONES ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// --- RUTAS ---
app.post("/api/notificar", async (req, res) => {
  const { correo, telefono, mensaje, tipo } = req.body;

  try {
    if (tipo === "correo") {
      await transporter.sendMail({
        from: `Orquídea Smart <${process.env.EMAIL_USER}>`,
        to: correo,
        subject: "🌿 Recordatorio de Riego - Orquídea Smart",
        text: mensaje
      });
      console.log(`Correo enviado a ${correo}`);
      return res.json({ ok: true, msg: "Correo enviado correctamente" });
    }

    if (tipo === "sms") {
      await twilioClient.messages.create({
        body: mensaje,
        from: process.env.TWILIO_PHONE,
        to: telefono
      });
      console.log(`SMS enviado a ${telefono}`);
      return res.json({ ok: true, msg: "SMS enviado correctamente" });
    }

    res.status(400).json({ ok: false, msg: "Tipo de notificación inválido" });
  } catch (error) {
    console.error("❌ Error enviando notificación:", error);
    res.status(500).json({ ok: false, msg: "Error al enviar notificación" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
