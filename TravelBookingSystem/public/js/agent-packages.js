const API = '/api/agent/packages';
const API_TRIPS = '/api/agent/trips';

// ===== ELEMENTS =====
const packageModal        = document.getElementById('packageModal');
const openPackageModalBtn = document.getElementById('openPackageModalBtn');
const closePackageModalBtn = document.getElementById('closePackageModalBtn');
const packageForm         = document.getElementById('packageForm');
const packageFormTitle    = document.getElementById('packageFormTitle');
const packageIdInput      = document.getElementById('packageId');
const titleInput          = document.getElementById('title');
const destinationInput    = document.getElementById('destination');
const startDateInput      = document.getElementById('startDate');
const endDateInput        = document.getElementById('endDate');
const descriptionInput    = document.getElementById('description');
const priceInput          = document.getElementById('price');
const itineraryList       = document.getElementById('itineraryList');
const addItineraryBtn     = document.getElementById('addItineraryBtn');
const cancelEditBtn       = document.getElementById('cancelEditBtn');
const packagesBody        = document.getElementById('packagesBody');
const searchInput         = document.getElementById('searchInput');
const filterDropdown      = document.getElementById('filterDropdown');

// Trip detail modal
const tripModal        = document.getElementById('tripModal');
const closeTripModalBtn = document.getElementById('closeTripModalBtn');

// Agent name from token
const payload = getTokenPayload();
if (payload) {
    const nameEl = document.getElementById('agentName');
    if (nameEl) nameEl.textContent = payload.first_name || 'Agent';
}

function getTokenPayload() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch { return null; }
}

// ===== ALL TRIPS DATA =====
let allTrips = [];

// ===== LOAD TRIPS =====
async function loadTrips() {
    const res = await fetch(API_TRIPS);
    allTrips = await res.json();
    renderTrips(allTrips);
}

function renderTrips(trips) {
    packagesBody.innerHTML = '';
    trips.forEach(t => {
        const tr = document.createElement('tr');
        const startDate = t.start_date ? new Date(t.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const endDate   = t.end_date   ? new Date(t.end_date).toLocaleDateString('en-GB',   { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const statusClass = t.status ? t.status.toLowerCase() : '';
        tr.innerHTML = `
            <td>${t.trip_id}</td>
            <td>${t.package_name}</td>
            <td>${t.traveller}</td>
            <td>${startDate} - ${endDate}</td>
            <td class="status-${statusClass}">${t.status}</td>
            <td><button class="btn-view" data-id="${t.booking_id}">View</button></td>
        `;
        tr.querySelector('.btn-view').addEventListener('click', () => openTripDetail(t));
        packagesBody.appendChild(tr);
    });
}

// ===== SEARCH & FILTER =====
function applyFilters() {
    const query  = searchInput.value.toLowerCase();
    const status = filterDropdown.value;
    const filtered = allTrips.filter(t => {
        const matchesSearch = !query ||
            t.trip_id.toLowerCase().includes(query) ||
            t.package_name.toLowerCase().includes(query) ||
            t.traveller.toLowerCase().includes(query);
        const matchesStatus = !status || t.status === status;
        return matchesSearch && matchesStatus;
    });
    renderTrips(filtered);
}

searchInput.addEventListener('input', applyFilters);
filterDropdown.addEventListener('change', applyFilters);

// ===== TRIP DETAIL MODAL =====
function openTripDetail(trip) {
    const startDate = trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() : '-';
    const endDate   = trip.end_date   ? new Date(trip.end_date).toLocaleDateString('en-GB',   { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase() : '-';

    document.getElementById('tripTitle').textContent       = `Trip: ${trip.trip_id}`;
    document.getElementById('tripPackageName').textContent = trip.package_name;
    document.getElementById('tripStatus').textContent      = trip.status;
    document.getElementById('tripStartDate').textContent   = startDate;
    document.getElementById('tripEndDate').textContent     = endDate;
    document.getElementById('tripCost').textContent        = trip.cost ? `£${Number(trip.cost).toLocaleString()}` : '-';

    tripModal.classList.add('active');
}

closeTripModalBtn.addEventListener('click', () => tripModal.classList.remove('active'));
tripModal.addEventListener('click', (e) => { if (e.target === tripModal) tripModal.classList.remove('active'); });

// ===== PACKAGE CREATE MODAL =====
function openPackageModal() { packageModal.classList.add('active'); }
function closePackageModal() { packageModal.classList.remove('active'); resetForm(); }

openPackageModalBtn.addEventListener('click', () => {
    packageFormTitle.textContent = 'Add New Package';
    cancelEditBtn.style.display = 'none';
    openPackageModal();
});
closePackageModalBtn.addEventListener('click', closePackageModal);
packageModal.addEventListener('click', (e) => { if (e.target === packageModal) closePackageModal(); });

// ===== ITINERARY =====
function addItineraryItem(title = '', desc = '') {
    const div = document.createElement('div');
    div.className = 'itinerary-item';
    div.innerHTML = `
        <input type="text" name="itinerary_title[]" placeholder="Item title" value="${title}" required>
        <textarea name="itinerary_description[]" placeholder="Item description" required>${desc}</textarea>
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    itineraryList.appendChild(div);
}

addItineraryBtn.addEventListener('click', () => addItineraryItem());

// ===== RESET FORM =====
function resetForm() {
    packageForm.reset();
    packageIdInput.value = '';
    packageFormTitle.textContent = 'Add New Package';
    cancelEditBtn.style.display = 'none';
    itineraryList.innerHTML = '';
    addItineraryItem();
}

cancelEditBtn.addEventListener('click', resetForm);

// ===== SUBMIT =====
packageForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titles = [...document.querySelectorAll('input[name="itinerary_title[]"]')].map(i => i.value);
    const descs  = [...document.querySelectorAll('textarea[name="itinerary_description[]"]')].map(t => t.value);
    const itinerary_items = titles.map((t, i) => ({ title: t, description: descs[i] }));

    const body = {
        title: titleInput.value,
        destination: destinationInput.value,
        start_date: startDateInput.value,
        end_date: endDateInput.value,
        description: descriptionInput.value,
        price: priceInput.value,
        itinerary_items
    };

    const id     = packageIdInput.value;
    const method = id ? 'PUT' : 'POST';
    const url    = id ? `${API}/${id}` : API;

    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    alert(data.message);
    closePackageModal();
    loadTrips();
});

loadTrips();
addItineraryItem();
