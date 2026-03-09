const API_BOOKINGS = '/api/agent/bookings';

const bookingModal        = document.getElementById('bookingModal');
const closeBookingModalBtn = document.getElementById('closeBookingModalBtn');
const updateStatusForm    = document.getElementById('updateStatusForm');
const modalBookingId      = document.getElementById('modalBookingId');
const modalBookingIdDisplay = document.getElementById('modalBookingIdDisplay');
const bookingsBody        = document.getElementById('bookingsBody');

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
async function loadBookings() {
    const res = await fetch(API_BOOKINGS);
    const bookings = await res.json();
    bookingsBody.innerHTML = '';
    bookings.forEach(b => {
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
    loadBookings();
});

loadBookings();
