const socket = io();
const humedadElem = document.getElementById("humedad");
const tempElem = document.getElementById("temperatura");
const luzElem = document.getElementById("luminosidad");
const estadoSensores = document.getElementById("estadoSensores");
const estadoHumedad = document.getElementById("estadoHumedad");
const estadoTemperatura = document.getElementById("estadoTemperatura");
const estadoLuz = document.getElementById("estadoLuz");
const panel = document.querySelector(".panel");

// === Gráfico con Chart.js ===
const ctx = document.getElementById("grafico");
const grafico = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Humedad (%)", data: [], borderColor: "#2e8b57", tension: 0.3 },
      { label: "Temperatura (°C)", data: [], borderColor: "#ff704d", tension: 0.3 },
      { label: "Luz (lx)", data: [], borderColor: "#ffcc00", tension: 0.3 },
    ],
  },
  options: { scales: { x: { ticks: { display: false } }, y: { beginAtZero: false } } },
});

// === Lectura en tiempo real desde Arduino vía Socket.IO ===
socket.on("lecturaArduino", (lectura) => {
  const { humedad, temperatura, luminosidad } = lectura;

  // Mostrar valores en la interfaz
  humedadElem.textContent = `${humedad}%`;
  tempElem.textContent = `${temperatura.toFixed(1)}°C`;
  luzElem.textContent = `${luminosidad} lx`;

  actualizarGrafico(humedad, temperatura, luminosidad);
  actualizarEstado(humedad, temperatura, luminosidad);
});

// === Botón de riego ===
document.getElementById("btnRegar").addEventListener("click", () => {
  socket.emit("regar");
  estadoSensores.textContent = "💧 Riego activado desde la aplicación.";
  panel.classList.add("estabilizando");
  setTimeout(() => panel.classList.remove("estabilizando"), 5000);
});

// === Funciones auxiliares ===
function actualizarGrafico(h, t, l) {
  const hora = new Date().toLocaleTimeString();
  const data = grafico.data;
  if (data.labels.length >= 25) {
    data.labels.shift();
    data.datasets.forEach(ds => ds.data.shift());
  }
  data.labels.push(hora);
  data.datasets[0].data.push(h);
  data.datasets[1].data.push(t);
  data.datasets[2].data.push(l);
  grafico.update();
}

function actualizarEstado(h, t, l) {
  estadoSensores.textContent = "Lectura recibida desde Arduino ✅";
  estadoSensores.style.color = "#2e8b57";

  if (h < 55) estadoHumedad.textContent = "Humedad baja ❌";
  else if (h > 90) estadoHumedad.textContent = "Humedad alta ⚠";
  else estadoHumedad.textContent = "Humedad ideal ✅";

  if (t < 18) estadoTemperatura.textContent = "Temperatura baja ❄";
  else if (t > 28) estadoTemperatura.textContent = "Temperatura alta ☀";
  else estadoTemperatura.textContent = "Temperatura ideal ✅";

  if (l < 20000) estadoLuz.textContent = "Poca luz 🌑";
  else if (l > 80000) estadoLuz.textContent = "Exceso de luz ☀";
  else estadoLuz.textContent = "Luz adecuada 🌿";
}

// === Obtener historial desde Node.js (cada 10 segundos) ===
async function obtenerLecturas() {
  try {
    const res = await fetch("http://localhost:3000/api/registros");
    const datos = await res.json();

    if (Array.isArray(datos) && datos.length > 0) {
      console.log("📊 Lecturas históricas:", datos.slice(0, 5)); // muestra solo 5 últimas
    }

  } catch (error) {
    console.error("⚠️ Error al obtener lecturas:", error);
  }
}

// Ejecutar cada 10 segundos
setInterval(obtenerLecturas, 10000);
