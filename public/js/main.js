let humedad = 75;
let temperatura = 23;
let tendenciaHumedad = -0.4;
let tendenciaTemperatura = 0.25;

const subject = new Subject();
let notificacionesActivas = false;
let ultimaAlerta = "";
let ciclos = 0;

// Modo estabilización por riego
let estabilizando = false;
let estabilizarHasta = 0;
const DURACION_ESTABILIZACION = 60000;
const INCREMENTO_RIEGO_MIN = 8;
const INCREMENTO_RIEGO_MAX = 12;

const humedadElem = document.getElementById("humedad");
const tempElem = document.getElementById("temperatura");
const estadoHumedad = document.getElementById("estadoHumedad");
const estadoTemperatura = document.getElementById("estadoTemperatura");
const estadoSensores = document.getElementById("estadoSensores");
const correoInput = document.getElementById("correo");
const telefonoInput = document.getElementById("telefono");
const formNotificacion = document.getElementById("formNotificacion");
const panel = document.querySelector(".panel");
const botonRegar = document.getElementById("btnRegar");

const ctx = document.getElementById("grafico");
const grafico = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Humedad (%)", data: [], borderColor: "#2e8b57", tension: 0.3 },
      { label: "Temperatura (°C)", data: [], borderColor: "#ff704d", tension: 0.3 }
    ]
  },
  options: { scales: { x: { ticks: { display: false } }, y: { beginAtZero: false } } }
});

formNotificacion.addEventListener("submit", e => {
  e.preventDefault();
  const correo = correoInput.value.trim();
  const telefono = telefonoInput.value.trim();

  if (correo) subject.subscribe(new EmailNotifier(correo));
  if (telefono) subject.subscribe(new SmsNotifier(telefono));

  notificacionesActivas = true;
  alert("🔔 Notificaciones activadas correctamente.");
});

if (botonRegar) {
  botonRegar.addEventListener("click", () => {
    const incremento = INCREMENTO_RIEGO_MIN + Math.random() * (INCREMENTO_RIEGO_MAX - INCREMENTO_RIEGO_MIN);
    humedad = Math.min(100, humedad + incremento);

    estabilizando = true;
    estabilizarHasta = Date.now() + DURACION_ESTABILIZACION;

    estadoSensores.textContent = `💧 Riego activado: estabilizando...`;
    estadoSensores.style.color = "#2e8b57";
    panel.classList.add("estabilizando");

    actualizarUI();
    actualizarGrafico();
  });
}

// Cada cierto tiempo, se fuerza un cambio de ambiente (sequía o calor repentino)
function eventoClimatico() {
  const tipo = Math.random();
  if (tipo < 0.4) {
    // Sequía
    tendenciaHumedad = -1.2;
    tendenciaTemperatura = 0.5;
    console.log("Evento: Sequía simulada");
  } else if (tipo < 0.8) {
    // Ola de calor
    tendenciaTemperatura = 0.9;
    console.log("Evento: Ola de calor simulada");
  } else {
    // Lluvia
    tendenciaHumedad = 1.5;
    tendenciaTemperatura = -0.3;
    console.log("Evento: Lluvia simulada");
  }
}
setInterval(eventoClimatico, 45000 + Math.random() * 30000); // cada 45–75 s

// Simulación periódica
function generarLecturas() {
  ciclos++;

  if (ciclos % 20 === 0) tendenciaTemperatura *= -1;
  if (ciclos % 50 === 0) tendenciaHumedad *= -1;

  if (estabilizando) {
    temperatura += (Math.random() * 0.4 - 0.2);
    humedad += (Math.random() * 1.0 - 0.5);
    if (Date.now() >= estabilizarHasta) {
      estabilizando = false;
      panel.classList.remove("estabilizando");
      estadoSensores.textContent = "Sensores estables ✅";
      estadoSensores.style.color = "#2e8b57";
      tendenciaHumedad = -0.4;
      tendenciaTemperatura = 0.25;
    }
  } else {
    temperatura += tendenciaTemperatura + (Math.random() * 1.5 - 0.75);
    humedad += tendenciaHumedad + (Math.random() * 4 - 2);
  }

  temperatura = Math.max(14, Math.min(33, temperatura));
  humedad = Math.max(25, Math.min(98, humedad));

  actualizarUI();
  verificarAlertas();
  actualizarGrafico();
}

function actualizarUI() {
  humedadElem.textContent = `${humedad.toFixed(1)}%`;
  tempElem.textContent = `${temperatura.toFixed(1)}°C`;

  if (humedad < 55) {
    humedadElem.style.color = "#b5651d";
    estadoHumedad.textContent = "Humedad baja ❌";
  } else if (humedad > 90) {
    humedadElem.style.color = "#ffbf00";
    estadoHumedad.textContent = "Humedad alta ⚠️";
  } else {
    humedadElem.style.color = "#2e8b57";
    estadoHumedad.textContent = "Nivel óptimo ✅";
  }

  if (temperatura < 18) {
    tempElem.style.color = "#3399ff";
    estadoTemperatura.textContent = "Temperatura baja ❄️";
  } else if (temperatura > 28) {
    tempElem.style.color = "#ff4d4d";
    estadoTemperatura.textContent = "Temperatura alta ☀️";
  } else {
    tempElem.style.color = "#2e8b57";
    estadoTemperatura.textContent = "Temperatura ideal ✅";
  }
}

function verificarAlertas() {
  if (!notificacionesActivas) return;
  let mensaje = "";
  let tipo = "";

  if (humedad < 55) { mensaje = "⚠️ Humedad baja. Necesita riego."; tipo = "bajaHumedad"; }
  else if (humedad > 90) { mensaje = "⚠️ Humedad excesiva."; tipo = "altaHumedad"; }
  else if (temperatura < 18) { mensaje = "⚠️ Temperatura baja."; tipo = "bajaTemp"; }
  else if (temperatura > 28) { mensaje = "⚠️ Temperatura alta."; tipo = "altaTemp"; }
  else { quitarParpadeo(); ultimaAlerta = ""; return; }

  if (mensaje === ultimaAlerta) return;
  ultimaAlerta = mensaje;
  mostrarAlertaVisual(mensaje, tipo);
  subject.notify(mensaje);
}

function mostrarAlertaVisual(mensaje, tipo) {
  panel.classList.remove("alerta-parpadeo-roja", "alerta-parpadeo-azul", "alerta-parpadeo-amarilla", "alerta-parpadeo-marron");
  switch (tipo) {
    case "altaTemp": panel.classList.add("alerta-parpadeo-roja"); break;
    case "bajaTemp": panel.classList.add("alerta-parpadeo-azul"); break;
    case "altaHumedad": panel.classList.add("alerta-parpadeo-amarilla"); break;
    case "bajaHumedad": panel.classList.add("alerta-parpadeo-marron"); break;
  }
  estadoSensores.textContent = mensaje;
  estadoSensores.style.color = "#fff";
}

function quitarParpadeo() {
  panel.classList.remove("alerta-parpadeo-roja", "alerta-parpadeo-azul", "alerta-parpadeo-amarilla", "alerta-parpadeo-marron");
  estadoSensores.style.color = "#2e8b57";
  estadoSensores.textContent = "Sensores estables ✅";
}

function actualizarGrafico() {
  const hora = new Date().toLocaleTimeString();
  const data = grafico.data;
  if (data.labels.length >= 25) {
    data.labels.shift();
    data.datasets[0].data.shift();
    data.datasets[1].data.shift();
  }
  data.labels.push(hora);
  data.datasets[0].data.push(parseFloat(humedad.toFixed(1)));
  data.datasets[1].data.push(parseFloat(temperatura.toFixed(1)));
  grafico.update();
}

setInterval(generarLecturas, 3000);
generarLecturas();
