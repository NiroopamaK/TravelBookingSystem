const API_BOOKINGS = '/api/agent/bookings';

const updateStatusForm = document.getElementById('updateStatusForm');
const bookingsBody = document.getElementById('bookingsBody');

async function loadBookings() {
    const res = await fetch(API_BOOKINGS);
    const bookings = await res.json();
    bookingsBody.innerHTML = '';
    bookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${b.booking_id}</td>
            <td>${b.user_id}</td>
            <td>${b.package_id}</td>
            <td>${b.packsize}</td>
            <td>${b.additional_notes || ''}</td>
            <td>${b.total_price}</td>
            <td>${b.status}</td>
        `;
        bookingsBody.appendChild(tr);
    });
}

updateStatusForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('bookingId').value;
    const status = document.getElementById('status').value;

    const res = await fetch(`${API_BOOKINGS}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });

    const data = await res.json();
    alert(data.message);
    updateStatusForm.reset();
    loadBookings();
});

loadBookings();
