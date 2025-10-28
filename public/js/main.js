if (document.getElementById("formRiego")) {
  const subject = new Subject();

  document.getElementById("formRiego").addEventListener("submit", e => {
    e.preventDefault();

    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;

    const lista = document.getElementById("listaRiegos");

    // 💡 Si el mensaje por defecto está presente, eliminarlo
    const mensajeDefault = lista.querySelector("p");
    if (mensajeDefault && mensajeDefault.textContent.includes("No hay riegos")) {
      lista.innerHTML = "<h3>Riegos Programados</h3>";
    }

    // Registrar observadores (correo o SMS)
    if (correo) subject.subscribe(new EmailNotifier(correo));
    if (telefono) subject.subscribe(new SmsNotifier(telefono));

    // Agregar nuevo riego a la lista
    const item = document.createElement("p");
    item.textContent = `🌱 Riego programado para ${fecha} a las ${hora}`;
    lista.appendChild(item);

    // Simulación de notificación automática (5 segundos)
    setTimeout(() => {
      subject.notify(`🌿 ¡Hora de regar tus orquídeas! (${fecha} ${hora})`);
    }, 5000);

    // Limpiar formulario
    e.target.reset();
  });
}
