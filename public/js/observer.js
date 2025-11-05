class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  notify(mensaje) {
    this.observers.forEach(observer => observer.update(mensaje));
  }
}

class EmailNotifier {
  constructor(correo) {
    this.correo = correo;
  }

  async update(mensaje) {
    await fetch("/api/notificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: this.correo, mensaje })
    });
  }
}

class SmsNotifier {
  constructor(telefono) {
    this.telefono = telefono;
  }

  async update(mensaje) {
    await fetch("/api/notificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono: this.telefono, mensaje })
    });
  }
}
