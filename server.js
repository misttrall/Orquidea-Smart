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

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Enviar correo o SMS según disponibilidad
app.post("/api/notificar", async (req, res) => {
  const { correo, telefono, mensaje } = req.body;

  try {
    // Si hay correo, enviar email
    if (correo) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: "Orquídea Smart <orquidea.smart@notificaciones.com>",
        to: correo,
        subject: "🌿 Alerta de Monitoreo - Orquídea Smart",
        text: mensaje
      });
      console.log(`Correo enviado a ${correo}`);
    }

    // Si hay teléfono, enviar SMS
    if (telefono) {
      await twilioClient.messages.create({
        body: mensaje,
        from: process.env.TWILIO_PHONE,
        to: telefono
      });
      console.log(`SMS enviado a ${telefono}`);
    }

    res.json({ ok: true, msg: "Notificación enviada correctamente" });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    res.status(500).json({ ok: false, msg: "Error al enviar notificación" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
