const token = localStorage.getItem('token');
const authHeaders = { Authorization: 'Bearer ' + token };

let currentPage  = 1;
let currentLimit = 5;
let totalPages   = 1;

async function loadStats() {
    const res = await fetch('/api/agent/dashboard-stats', { headers: authHeaders });
    const data = await res.json();
    document.getElementById('totalPackages').textContent = data.totalPackages;
    document.getElementById('totalTrips').textContent = data.totalTrips;
    document.getElementById('confirmedBookings').textContent = data.confirmedBookings;
}

async function loadTrips(page = 1) {
    currentPage = page;
    const res = await fetch(`/api/agent/trips?page=${currentPage}&limit=${currentLimit}`, { headers: authHeaders });
    const result = await res.json();
    totalPages = result.totalPages;

    const tbody = document.getElementById('tripsBody');
    tbody.innerHTML = '';
    result.data.forEach(t => {
        const tr = document.createElement('tr');
        const startDate = t.start_date ? new Date(t.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const endDate   = t.end_date   ? new Date(t.end_date).toLocaleDateString('en-GB',   { day: 'numeric', month: 'short', year: 'numeric' }) : '';
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

    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('tripsPagination');
    if (!container) return;
    container.innerHTML = `
        <div class="pagination-controls">
            <button class="page-btn" onclick="loadTrips(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>&laquo; Prev</button>
            <span class="page-info">Page ${currentPage} of ${totalPages}</span>
            <button class="page-btn" onclick="loadTrips(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Next &raquo;</button>
        </div>
        <div class="pagination-limit">
            <span>Show</span>
            <select class="limit-select" onchange="changeTripLimit(this.value)">
                ${[5, 10, 25, 50].map(n => `<option value="${n}" ${n === currentLimit ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
            <span>per page</span>
        </div>
    `;
}

function changeTripLimit(val) {
    currentLimit = parseInt(val);
    loadTrips(1);
}

function viewTrip(trip) {
    window.location.href = `/agent/packages?view=${trip.booking_id}`;
}

loadStats();
loadTrips();
