if (document.getElementById("formRiego")) {
  const subject = new Subject();

  document.getElementById("formRiego").addEventListener("submit", e => {
    e.preventDefault();
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;

    // Suscribimos ambos observadores si los datos existen
    if (correo) subject.subscribe(new EmailNotifier(correo));
    if (telefono) subject.subscribe(new SmsNotifier(telefono));

    const lista = document.getElementById("listaRiegos");
    const item = document.createElement("p");
    item.textContent = `🌱 Riego programado para ${fecha} a las ${hora}`;
    lista.appendChild(item);

    // Simulación de notificación
    setTimeout(() => {
      subject.notify(`🌿 ¡Hora de regar tus orquídeas! (${fecha} ${hora})`);
    }, 5000);
  });
}
