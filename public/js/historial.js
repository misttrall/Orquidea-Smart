// ===============================
//   HISTORIAL DE RIEGOS
// ===============================

// Apunta al <tbody> de la tabla
const tabla = document.querySelector("#tabla-historial tbody");

// Inicializar socket
const socket = io();

// ===============================
// CARGAR HISTORIAL DESDE DB
// ===============================
async function cargarHistorial() {
  try {
    const res = await fetch("/api/registros");
    const data = await res.json();

    if (!tabla) return;
    tabla.innerHTML = ""; // Limpiar tabla antes de cargar

    // Mostrar hasta los últimos 50 registros
    data.slice(-50).reverse().forEach(r => {
      agregarRegistro(r);
    });

  } catch (error) {
    console.error("❌ Error cargando historial:", error);
  }
}

// ===============================
// AGREGAR UN REGISTRO A LA TABLA
// ===============================
function agregarRegistro(registro) {
  if (!tabla) return;

  const fila = document.createElement("tr");

  fila.innerHTML = `
    <td>${registro.id || "-"}</td>
    <td>${registro.evento || "-"}</td>
    <td>${registro.valor !== undefined ? registro.valor : "-"}</td>
    <td>${registro.temperatura !== undefined ? registro.temperatura.toFixed(1) + "°C" : "-"}</td>
    <td>${registro.humedad !== undefined ? registro.humedad + "%" : "-"}</td>
    <td>${registro.fecha_hora ? new Date(registro.fecha_hora).toLocaleString() : "-"}</td>
  `;

  tabla.prepend(fila); // Agrega al inicio (más reciente arriba)
}

// ===============================
// ESCUCHAR NUEVOS REGISTROS EN TIEMPO REAL
// ===============================
socket.on("nuevoRegistroCliente", registro => {
  agregarRegistro(registro);
});

// ===============================
// ACTUALIZAR HISTORIAL CADA 20s (fallback)
// ===============================
setInterval(cargarHistorial, 20000);

// ===============================
// CARGAR HISTORIAL AL INICIO
// ===============================
cargarHistorial();
