async function cargarHistorial() {
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
      <td>${r.fecha_hora}</td>
    `;
    tabla.appendChild(fila);
  });
}

// Simulación de envío automático cada 50 segundos
setInterval(async () => {
  const temp = (20 + Math.random() * 5).toFixed(2);
  const hum = (60 + Math.random() * 10).toFixed(2);

  await fetch("http://localhost:3000/api/guardar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ temperatura: temp, humedad: hum })
  });

  console.log(`🌡️ Enviado: ${temp} °C | 💧 ${hum} %`);
  cargarHistorial();
}, 50000);

cargarHistorial();
