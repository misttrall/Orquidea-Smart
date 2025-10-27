class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

// Observador de correo
class EmailNotifier {
  constructor(correo) {
    this.correo = correo;
  }

  async update(mensaje) {
    const res = await fetch("/api/notificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "correo",
        correo: this.correo,
        mensaje
      })
    });
    const result = await res.json();
    alert(result.ok ? `✅ Correo enviado a ${this.correo}` : "❌ Error al enviar correo");
  }
}

// Observador de SMS
class SmsNotifier {
  constructor(telefono) {
    this.telefono = telefono;
  }

  async update(mensaje) {
    const res = await fetch("/api/notificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: "sms",
        telefono: this.telefono,
        mensaje
      })
    });
    const result = await res.json();
    alert(result.ok ? `📱 SMS enviado a ${this.telefono}` : "❌ Error al enviar SMS");
  }
}
