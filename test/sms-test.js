import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

client.messages
  .create({
    body: "🌱 Este es un mensaje de prueba de Orquídea Smart",
    from: process.env.TWILIO_PHONE,
    to: "+569XXXXXXX" // tu número verificado
  })
  .then(msg => console.log("✅ SMS enviado:", msg.sid))
  .catch(err => console.error("❌ Error:", err));
