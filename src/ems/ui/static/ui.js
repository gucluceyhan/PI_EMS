const API_BASE = '';

async function fetchJSON(path) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: 'Bearer LOCAL_API_TOKEN',
    },
  });
  if (!resp.ok) {
    throw new Error(`Request failed: ${resp.status}`);
  }
  return resp.json();
}

async function loadDevices() {
  const devices = await fetchJSON('/devices');
  const grid = document.getElementById('device-grid');
  grid.innerHTML = '';
  devices.forEach((device) => {
    const card = document.createElement('div');
    card.className = `device-card ${device.healthy ? 'healthy' : 'unhealthy'}`;
    card.innerHTML = `<h3>${device.device_id}</h3><p>Type: ${device.type}</p><p>Healthy: ${device.healthy}</p>`;
    grid.appendChild(card);
  });
}

async function loadMeasurements() {
  const tbody = document.getElementById('measurement-body');
  tbody.innerHTML = '';
  const devices = await fetchJSON('/devices');
  for (const device of devices) {
    const rows = await fetchJSON(`/measurements?device_id=${device.device_id}`);
    rows.slice(0, 5).forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.timestamp_utc}</td><td>${row.device_id}</td><td>${row.metric}</td><td>${row.value?.toFixed?.(2) ?? row.value}</td><td>${row.unit ?? ''}</td>`;
      tbody.appendChild(tr);
    });
  }
}

async function refresh() {
  try {
    await Promise.all([loadDevices(), loadMeasurements()]);
  } catch (err) {
    console.error('Refresh failed', err);
  } finally {
    setTimeout(refresh, 60000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  refresh();
});
