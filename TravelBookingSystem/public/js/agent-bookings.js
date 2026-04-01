const API_BOOKINGS = '/api/agent/bookings';

const bookingModal          = document.getElementById('bookingModal');
const closeBookingModalBtn  = document.getElementById('closeBookingModalBtn');
const updateStatusForm      = document.getElementById('updateStatusForm');
const modalBookingId        = document.getElementById('modalBookingId');
const modalBookingIdDisplay = document.getElementById('modalBookingIdDisplay');
const bookingsBody          = document.getElementById('bookingsBody');

const tripInfoModal         = document.getElementById('tripInfoModal');
const closeTripInfoModalBtn = document.getElementById('closeTripInfoModalBtn');

let currentPage  = 1;
let currentLimit = 5;
let totalPages   = 1;
const bookingsMap = {};

/*  TRIP INFO MODAL  */
function openTripInfoModal(bookingId) {
    const booking = bookingsMap[bookingId];
    if (!booking) return;
    document.getElementById('tripInfoId').textContent   = 'Trip: ' + booking.trip_id;
    document.getElementById('tripInfoName').textContent = booking.package_name;

    const statusEl = document.getElementById('tripInfoStatus');
    statusEl.textContent  = booking.status;
    statusEl.className    = 'trip-status-badge status-' + (booking.status ? booking.status.toLowerCase() : '');

    const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() : '-';
    document.getElementById('tripInfoStartDate').textContent = fmt(booking.start_date);
    document.getElementById('tripInfoEndDate').textContent   = fmt(booking.end_date);
    document.getElementById('tripInfoCost').textContent      = booking.cost != null ? '£' + Number(booking.cost).toLocaleString('en-GB', { minimumFractionDigits: 0 }) : '-';

    tripInfoModal.classList.add('active');
}

function closeTripInfoModal() {
    tripInfoModal.classList.remove('active');
}

closeTripInfoModalBtn.addEventListener('click', closeTripInfoModal);
tripInfoModal.addEventListener('click', (e) => {
    if (e.target === tripInfoModal) closeTripInfoModal();
});

/*  BOOKING STATUS MODAL  */
function openBookingModal(id) {
    modalBookingId.value = id;
    modalBookingIdDisplay.textContent = id;
    document.getElementById('status').value = '';
    bookingModal.classList.add('active');
}

function closeBookingModal() {
    bookingModal.classList.remove('active');
    updateStatusForm.reset();
}

closeBookingModalBtn.addEventListener('click', closeBookingModal);
bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
});

/*  AUTOCOMPLETE  */
function setupAutocomplete(inputId, listId, apiUrl) {
    const input = document.getElementById(inputId);
    const list  = document.getElementById(listId);
    let debounceTimer = null;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const q = input.value.trim();
        if (!q) { list.innerHTML = ''; list.classList.remove('open'); return; }

        debounceTimer = setTimeout(async () => {
            try {
                const res  = await fetch(`${apiUrl}?q=${encodeURIComponent(q)}`, { credentials: 'include' });
                const data = await res.json();
                list.innerHTML = '';
                if (!data.length) { list.classList.remove('open'); return; }
                data.forEach(name => {
                    const li = document.createElement('li');
                    li.textContent = name;
                    li.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        input.value = name;
                        list.innerHTML = '';
                        list.classList.remove('open');
                        loadBookings(1);
                    });
                    list.appendChild(li);
                });
                list.classList.add('open');
            } catch (err) {
                console.error('Autocomplete error:', err);
            }
        }, 200);
    });

    input.addEventListener('blur', () => {
        setTimeout(() => { list.innerHTML = ''; list.classList.remove('open'); }, 150);
    });
}

setupAutocomplete('filterTraveller', 'filterTravellerList', '/api/agent/bookings/suggestions/travellers');
setupAutocomplete('filterPackage',   'filterPackageList',   '/api/agent/bookings/suggestions/packages');

/*  FILTERS  */
document.getElementById('applyFiltersBtn').addEventListener('click', () => loadBookings(1));
document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    document.getElementById('filterTraveller').value = '';
    document.getElementById('filterPackage').value   = '';
    document.getElementById('filterStatus').value    = '';
    loadBookings(1);
});

function buildFilterParams() {
    const traveller = document.getElementById('filterTraveller').value.trim();
    const pkg       = document.getElementById('filterPackage').value.trim();
    const status    = document.getElementById('filterStatus').value;
    const params = new URLSearchParams();
    if (traveller) params.set('traveller', traveller);
    if (pkg)       params.set('package',   pkg);
    if (status)    params.set('status',    status);
    return params.toString();
}

/*  LOAD BOOKINGS  */
async function loadBookings(page = 1) {
    try {
        currentPage = page;
        const filters = buildFilterParams();
        const query   = `page=${currentPage}&limit=${currentLimit}${filters ? '&' + filters : ''}`;
        const res = await fetch(`${API_BOOKINGS}?${query}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch bookings');

        const result = await res.json();
        totalPages = result.totalPages;

        bookingsBody.innerHTML = '';
        result.data.forEach(b => {
            bookingsMap[b.booking_id] = b;
            const tr = document.createElement('tr');
            const startDate = b.start_date ? new Date(b.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
            const endDate   = b.end_date   ? new Date(b.end_date).toLocaleDateString('en-GB',   { day: 'numeric', month: 'short', year: 'numeric' }) : '';
            tr.innerHTML = `
                <td>${b.trip_id}</td>
                <td>${b.package_name}</td>
                <td>${b.traveller}</td>
                <td>${startDate} - ${endDate}</td>
                <td class="status-${b.status ? b.status.toLowerCase() : ''}">${b.status}</td>
                <td>
                    <button class="btn-view" onclick="openTripInfoModal(${b.booking_id})">View</button>
                    <button class="btn-edit" onclick="openBookingModal(${b.booking_id})">Update Status</button>
                </td>
            `;
            bookingsBody.appendChild(tr);
        });

        renderPagination();
    } catch (err) {
        console.error('Error loading bookings:', err);
    }
}

/*  PAGINATION  */
function renderPagination() {
    const container = document.getElementById('bookingsPagination');
    if (!container) return;
    container.innerHTML = `
        <div class="pagination-controls">
            <button class="page-btn" onclick="loadBookings(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>&laquo; Prev</button>
            <span class="page-info">Page ${currentPage} of ${totalPages}</span>
            <button class="page-btn" onclick="loadBookings(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Next &raquo;</button>
        </div>
        <div class="pagination-limit">
            <span>Show</span>
            <select class="limit-select" onchange="changeBookingLimit(this.value)">
                ${[5, 10, 25, 50].map(n => `<option value="${n}" ${n === currentLimit ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
            <span>per page</span>
        </div>
    `;
}

function changeBookingLimit(val) {
    currentLimit = parseInt(val);
    loadBookings(1);
}

/*  SUBMIT  */
updateStatusForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id     = modalBookingId.value;
    const status = document.getElementById('status').value;

    try {
        const res = await fetch(`${API_BOOKINGS}/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to update status');
        const data = await res.json();
        alert(data.message);
        closeBookingModal();
        loadBookings(currentPage);
    } catch (err) {
        console.error('Error updating booking status:', err);
        alert('Could not update booking status');
    }
});

loadBookings();