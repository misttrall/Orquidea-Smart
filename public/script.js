// ===============================
//   CARGAR HISTORIAL DESDE DB
// ===============================
async function cargarHistorial() {
  try {
    const res = await fetch("http://localhost:3000/api/registros");
    const data = await res.json();

    const tabla = document.getElementById("tabla-historial");
    tabla.innerHTML = "";

    data.forEach(r => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${r.id}</td>
        <td>${r.temperatura} °C</td>
        <td>${r.humedad} %</td>
        <td>${r.luz} lx</td>
        <td>${r.fecha}</td>
      `;
      tabla.appendChild(fila);
    });

  } catch (error) {
    console.error("❌ Error cargando historial:", error);
  }
}

// ===============================
//   RECIBIR DATOS EN TIEMPO REAL
// ===============================
const socket = io();

socket.on("datos", (data) => {
  document.getElementById("temperatura").textContent = data.temperatura + " °C";
  document.getElementById("humedad").textContent = data.humedad + " %";
});

// ===============================
//   BOTÓN DE RIEGO
// ===============================
document.getElementById("btnRegar").addEventListener("click", async () => {
  try {
    await fetch("http://localhost:3000/regar", { method: "POST" });
    alert("💧 Riego activado");

    cargarHistorial(); // refrescar historial
  } catch (e) {
    console.error("❌ Error activando riego:", e);
  }
});

// Cargar historial al abrir
cargarHistorial();
