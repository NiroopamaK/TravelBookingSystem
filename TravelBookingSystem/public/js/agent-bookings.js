const API_BOOKINGS = '/api/agent/bookings';
const token = localStorage.getItem('token');
const authHeaders = { Authorization: 'Bearer ' + token };

const bookingModal          = document.getElementById('bookingModal');
const closeBookingModalBtn  = document.getElementById('closeBookingModalBtn');
const updateStatusForm      = document.getElementById('updateStatusForm');
const modalBookingId        = document.getElementById('modalBookingId');
const modalBookingIdDisplay = document.getElementById('modalBookingIdDisplay');
const bookingsBody          = document.getElementById('bookingsBody');

let currentPage  = 1;
let currentLimit = 5;
let totalPages   = 1;

/* ===== MODAL ===== */
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

/* ===== LOAD BOOKINGS ===== */
async function loadBookings(page = 1) {
    currentPage = page;
    const res = await fetch(`${API_BOOKINGS}?page=${currentPage}&limit=${currentLimit}`, { headers: authHeaders });
    const result = await res.json();
    totalPages = result.totalPages;

    bookingsBody.innerHTML = '';
    result.data.forEach(b => {
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
                <button class="btn-edit" onclick="openBookingModal(${b.booking_id})">Update Status</button>
            </td>
        `;
        bookingsBody.appendChild(tr);
    });

    renderPagination();
}

/* ===== PAGINATION ===== */
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

/* ===== SUBMIT ===== */
updateStatusForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id     = modalBookingId.value;
    const status = document.getElementById('status').value;

    const res = await fetch(`${API_BOOKINGS}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });

    const data = await res.json();
    alert(data.message);
    closeBookingModal();
    loadBookings(currentPage);
});

loadBookings();
