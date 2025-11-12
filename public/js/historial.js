async function cargarHistorial() {
  try {
    const res = await fetch("http://localhost:3000/api/registros");
    const datos = await res.json();

    const tbody = document.querySelector("#tablaLecturas tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(datos) || datos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3">No hay registros disponibles.</td></tr>`;
      return;
    }

    // === Mostrar registros en la tabla ===
    datos.forEach(reg => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${new Date(reg.fecha_hora).toLocaleString()}</td>
        <td>${reg.temperatura.toFixed(1)}°C</td>
        <td>${reg.humedad.toFixed(1)}%</td>
      `;
      tbody.appendChild(fila);
    });

    // === Generar gráfico ===
    const ctx = document.getElementById("graficoHistorial");
    const etiquetas = datos.map(r => new Date(r.fecha_hora).toLocaleTimeString()).reverse();
    const temps = datos.map(r => r.temperatura).reverse();
    const hums = datos.map(r => r.humedad).reverse();

    new Chart(ctx, {
      type: "line",
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: "Temperatura (°C)",
            data: temps,
            borderColor: "#ff704d",
            backgroundColor: "rgba(255,112,77,0.1)",
            tension: 0.3
          },
          {
            label: "Humedad (%)",
            data: hums,
            borderColor: "#2e8b57",
            backgroundColor: "rgba(46,139,87,0.1)",
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: false },
          x: { ticks: { display: true } }
        }
      }
    });

  } catch (error) {
    console.error("⚠️ Error al cargar el historial:", error);
    const tbody = document.querySelector("#tablaLecturas tbody");
    tbody.innerHTML = `<tr><td colspan="3">Error al conectar con el servidor.</td></tr>`;
  }
}

// Cargar al abrir la página
document.addEventListener("DOMContentLoaded", cargarHistorial);
