// ======================================================
// ===============  ELEMENTOS DEL DOM  ==================
// ======================================================
const humedadElem = document.getElementById("humedad");
const tempElem = document.getElementById("temperatura");

const estadoHumedad = document.getElementById("estadoHumedad");
const estadoTemperatura = document.getElementById("estadoTemperatura");
const estadoSensores = document.getElementById("estadoSensores");

const panel = document.querySelector(".panel");
const listaRiegos = document.getElementById("listaRiegos");

// ======================================================
// =====================  SOCKET.IO  =====================
// ======================================================
const socket = io();

// Variable para mantener el estado actual
let lecturaActual = { humedad: 50, temperatura: 22 };

// ======================================================
// =======================  GRÁFICO ======================
// ======================================================
const ctx = document.getElementById("grafico");
const grafico = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "Humedad (%)", data: [], borderColor: "#2e8b57", tension: 0.3 },
      { label: "Temperatura (°C)", data: [], borderColor: "#ff704d", tension: 0.3 }
    ],
  },
  options: {
    responsive: true,
    scales: {
      x: { ticks: { display: false } },
      y: { beginAtZero: false },
    },
  },
});

// ======================================================
// ========== FUNCIONES AUXILIARES =====================
// ======================================================
function actualizarUI() {
  if (humedadElem) humedadElem.textContent = `${lecturaActual.humedad.toFixed(1)}%`;
  if (tempElem) tempElem.textContent = `${lecturaActual.temperatura.toFixed(1)}°C`;
}

function actualizarEstado(h, t) {
  if (estadoSensores) estadoSensores.textContent = "Datos recibidos 🌍";

  if (estadoHumedad) {
    if (h < 55) estadoHumedad.textContent = "Humedad baja ❌";
    else if (h > 90) estadoHumedad.textContent = "Humedad alta ⚠";
    else estadoHumedad.textContent = "Humedad ideal ✅";
  }

  if (estadoTemperatura) {
    if (t < 18) estadoTemperatura.textContent = "Temperatura baja ❄";
    else if (t > 28) estadoTemperatura.textContent = "Temperatura alta ☀";
    else estadoTemperatura.textContent = "Temperatura ideal ✅";
  }
}

function actualizarGrafico(h, t) {
  const hora = new Date().toLocaleTimeString();
  const data = grafico.data;

  if (data.labels.length >= 25) {
    data.labels.shift();
    data.datasets.forEach(ds => ds.data.shift());
  }

  data.labels.push(hora);
  data.datasets[0].data.push(h);
  data.datasets[1].data.push(t);
  grafico.update();
}

function agregarRegistroHistorial(registro) {
  if (!listaRiegos) return;

  const p = document.createElement("p");
  const fecha = new Date(registro.fecha || Date.now()).toLocaleString();
  p.textContent = `[${fecha}] ${registro.evento} - Humedad: ${registro.humedad.toFixed(1)}%, Temp: ${registro.temperatura.toFixed(1)}°C`;

  listaRiegos.prepend(p);
}

// ======================================================
// ==================  SOCKET.IO ========================
// ======================================================
socket.on("lecturaClima", (clima) => {
  lecturaActual.humedad = clima.humedad;
  lecturaActual.temperatura = clima.temperatura;

  actualizarUI();
  actualizarGrafico(lecturaActual.humedad, lecturaActual.temperatura);
  actualizarEstado(lecturaActual.humedad, lecturaActual.temperatura);
});

socket.on("nuevoRegistroCliente", (registro) => {
  lecturaActual.humedad = registro.humedad;
  lecturaActual.temperatura = registro.temperatura;

  actualizarUI();
  actualizarGrafico(lecturaActual.humedad, lecturaActual.temperatura);
  actualizarEstado(lecturaActual.humedad, lecturaActual.temperatura);

  agregarRegistroHistorial(registro);
});

// ======================================================
// ==================  RIEGO MANUAL =====================
// ======================================================
const btnRegar = document.getElementById("btnRegar");
if (btnRegar) {
  btnRegar.addEventListener("click", async () => {
    socket.emit("regarPlanta");

    // Animación de riego: humedad sube, temperatura baja a 14°C
    const pasos = 10;
    const tempObjetivo = 14;
    const humObjetivo = Math.min(lecturaActual.humedad + 30, 100);

    for (let i = 0; i < pasos; i++) {
      lecturaActual.humedad += (humObjetivo - lecturaActual.humedad)/(pasos - i);
      lecturaActual.temperatura -= (lecturaActual.temperatura - tempObjetivo)/(pasos - i);

      if (lecturaActual.humedad > 100) lecturaActual.humedad = 100;

      actualizarUI();
      actualizarGrafico(lecturaActual.humedad, lecturaActual.temperatura);
      actualizarEstado(lecturaActual.humedad, lecturaActual.temperatura);

      await new Promise(r => setTimeout(r, 300));
    }
  });
}

// ======================================================
// ======= EVAPORACIÓN DE HUMEDAD ======================
// ======================================================
const tasaEvaporacion = 0.5; // 0.5% cada ciclo
const intervaloEvaporacion = 10000; // cada 10s

setInterval(() => {
  lecturaActual.humedad -= tasaEvaporacion;
  if (lecturaActual.humedad < 0) lecturaActual.humedad = 0;

  actualizarUI();
  actualizarGrafico(lecturaActual.humedad, lecturaActual.temperatura);
  actualizarEstado(lecturaActual.humedad, lecturaActual.temperatura);
}, intervaloEvaporacion);

// ======================================================
// ======= CARGAR HISTORIAL AL INICIAR =================
// ======================================================
async function cargarHistorial() {
  try {
    const res = await fetch("/api/registros");
    const datos = await res.json();
    if (listaRiegos) {
      listaRiegos.innerHTML = "";
      datos.slice(-20).reverse().forEach(registro => {
        agregarRegistroHistorial(registro);
      });
    }
  } catch (error) {
    console.error("Error cargando historial:", error);
  }
}

cargarHistorial();
