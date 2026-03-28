let currentPage  = 1;
let currentLimit = 5;
let totalPages   = 1;
const tripsMap   = {};

// ================= STATS =================
async function loadStats() {
    try {
        const res = await fetch('/api/agent/dashboard-stats', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch stats');

        const data = await res.json();
        document.getElementById('totalPackages').textContent = data.totalPackages;
        document.getElementById('totalTrips').textContent = data.totalTrips;
        document.getElementById('confirmedBookings').textContent = data.confirmedBookings;
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// ================= TRIPS =================
async function loadTrips(page = 1) {
    try {
        currentPage = page;
        const res = await fetch(`/api/agent/trips?page=${currentPage}&limit=${currentLimit}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch trips');

        const result = await res.json();
        totalPages = result.totalPages;

        const tbody = document.getElementById('tripsBody');
        tbody.innerHTML = '';
        result.data.forEach(t => {
            tripsMap[t.booking_id] = t;
            const tr = document.createElement('tr');
            const startDate = t.start_date ? new Date(t.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
            const endDate   = t.end_date   ? new Date(t.end_date).toLocaleDateString('en-GB',   { day: 'numeric', month: 'short', year: 'numeric' }) : '';
            tr.innerHTML = `
                <td>${t.trip_id}</td>
                <td>${t.package_name}</td>
                <td>${t.traveller}</td>
                <td>${startDate} - ${endDate}</td>
                <td class="status-${t.status ? t.status.toLowerCase() : ''}">${t.status}</td>
                <td><button class="btn-view" onclick="viewTrip(${t.booking_id})">View</button></td>
            `;
            tbody.appendChild(tr);
        });

        renderPagination();
    } catch (err) {
        console.error('Error loading trips:', err);
    }
}

// ================= PAGINATION =================
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

// ================= TRIP MODAL =================
const tripInfoModal         = document.getElementById('tripInfoModal');
const closeTripInfoModalBtn = document.getElementById('closeTripInfoModalBtn');

function viewTrip(bookingId) {
    const trip = tripsMap[bookingId];
    if (!trip) return;

    document.getElementById('tripInfoId').textContent   = 'Trip: ' + trip.trip_id;
    document.getElementById('tripInfoName').textContent = trip.package_name;

    const statusEl = document.getElementById('tripInfoStatus');
    statusEl.textContent = trip.status;
    statusEl.className   = 'trip-status-badge status-' + (trip.status ? trip.status.toLowerCase() : '');

    const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() : '-';
    document.getElementById('tripInfoStartDate').textContent = fmt(trip.start_date);
    document.getElementById('tripInfoEndDate').textContent   = fmt(trip.end_date);
    document.getElementById('tripInfoCost').textContent      = trip.cost != null ? '£' + Number(trip.cost).toLocaleString('en-GB', { minimumFractionDigits: 0 }) : '-';

    tripInfoModal.classList.add('active');
}

closeTripInfoModalBtn.addEventListener('click', () => tripInfoModal.classList.remove('active'));
tripInfoModal.addEventListener('click', (e) => { if (e.target === tripInfoModal) tripInfoModal.classList.remove('active'); });

// ================= INIT =================
loadStats();
loadTrips();