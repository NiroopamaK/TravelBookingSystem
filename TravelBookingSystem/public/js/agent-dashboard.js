async function loadStats() {
    const res = await fetch('/api/agent/dashboard-stats');
    const data = await res.json();
    document.getElementById('totalPackages').textContent = data.totalPackages;
    document.getElementById('totalTrips').textContent = data.totalTrips;
    document.getElementById('confirmedBookings').textContent = data.confirmedBookings;
}

async function loadTrips() {
    const res = await fetch('/api/agent/trips');
    const trips = await res.json();
    const tbody = document.getElementById('tripsBody');
    tbody.innerHTML = '';
    trips.forEach(t => {
        const tr = document.createElement('tr');
        const startDate = t.start_date ? new Date(t.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const endDate = t.end_date ? new Date(t.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        tr.innerHTML = `
            <td>${t.trip_id}</td>
            <td>${t.package_name}</td>
            <td>${t.traveller}</td>
            <td>${startDate} - ${endDate}</td>
            <td class="status-${t.status ? t.status.toLowerCase() : ''}">${t.status}</td>
            <td><button class="btn-view" onclick="viewTrip(${JSON.stringify(t)})">View</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function viewTrip(trip) {
    window.location.href = `/agent/packages?view=${trip.booking_id}`;
}

loadStats();
loadTrips();
