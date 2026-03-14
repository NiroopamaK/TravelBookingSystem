const API = '/api/agent/packages';
const token = localStorage.getItem('token');
const authHeaders = { Authorization: 'Bearer ' + token };

// ===== ELEMENTS =====
const packageModal         = document.getElementById('packageModal');
const openPackageModalBtn  = document.getElementById('openPackageModalBtn');
const closePackageModalBtn = document.getElementById('closePackageModalBtn');
const packageForm          = document.getElementById('packageForm');
const packageFormTitle     = document.getElementById('packageFormTitle');
const packageIdInput       = document.getElementById('packageId');
const titleInput           = document.getElementById('title');
const destinationInput     = document.getElementById('destination');
const startDateInput       = document.getElementById('startDate');
const endDateInput         = document.getElementById('endDate');
const descriptionInput     = document.getElementById('description');
const priceInput           = document.getElementById('price');
const itineraryList        = document.getElementById('itineraryList');
const addItineraryBtn      = document.getElementById('addItineraryBtn');
const cancelEditBtn        = document.getElementById('cancelEditBtn');
const packagesBody         = document.getElementById('packagesBody');
const searchInput          = document.getElementById('searchInput');
const filterDropdown       = document.getElementById('filterDropdown');

let allPackages  = [];
let currentPage  = 1;
let currentLimit = 5;
let totalPages   = 1;

// ===== LOAD PACKAGES =====
async function loadPackages(page = 1) {
    currentPage = page;
    const res = await fetch(`${API}?page=${currentPage}&limit=${currentLimit}`, { headers: authHeaders });
    const result = await res.json();
    allPackages = result.data;
    totalPages  = result.totalPages;
    populateDestinationFilter(allPackages);
    renderPackages(allPackages);
    renderPagination();
}

function populateDestinationFilter(packages) {
    const destinations = [...new Set(packages.map(p => p.destination))];
    filterDropdown.innerHTML = '<option value="">All Destinations</option>';
    destinations.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        filterDropdown.appendChild(opt);
    });
}

function renderPackages(packages) {
    packagesBody.innerHTML = '';
    packages.forEach(pkg => {
        const tr = document.createElement('tr');
        const startDate = pkg.start_date ? pkg.start_date.slice(0, 10) : '';
        const endDate   = pkg.end_date   ? pkg.end_date.slice(0, 10)   : '';
        tr.innerHTML = `
            <td>${pkg.package_id}</td>
            <td>${pkg.title}</td>
            <td>${pkg.destination}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>£${Number(pkg.price).toLocaleString()}</td>
            <td>
                <button class="btn-edit" onclick="editPackage(${pkg.package_id})">Edit</button>
                <button class="btn-delete" onclick="deletePackage(${pkg.package_id})">Delete</button>
            </td>
        `;
        packagesBody.appendChild(tr);
    });
}

// ===== SEARCH & FILTER =====
function applyFilters() {
    const query       = searchInput.value.toLowerCase();
    const destination = filterDropdown.value;
    const filtered = allPackages.filter(p => {
        const matchesSearch = !query ||
            p.title.toLowerCase().includes(query) ||
            p.destination.toLowerCase().includes(query);
        const matchesDest = !destination || p.destination === destination;
        return matchesSearch && matchesDest;
    });
    renderPackages(filtered);
}

searchInput.addEventListener('input', applyFilters);
filterDropdown.addEventListener('change', applyFilters);

// ===== PAGINATION =====
function renderPagination() {
    const container = document.getElementById('packagesPagination');
    if (!container) return;
    container.innerHTML = `
        <div class="pagination-controls">
            <button class="page-btn" onclick="loadPackages(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>&laquo; Prev</button>
            <span class="page-info">Page ${currentPage} of ${totalPages}</span>
            <button class="page-btn" onclick="loadPackages(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>Next &raquo;</button>
        </div>
        <div class="pagination-limit">
            <span>Show</span>
            <select class="limit-select" onchange="changePackageLimit(this.value)">
                ${[5, 10, 25, 50].map(n => `<option value="${n}" ${n === currentLimit ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
            <span>per page</span>
        </div>
    `;
}

function changePackageLimit(val) {
    currentLimit = parseInt(val);
    loadPackages(1);
}

// ===== MODAL =====
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

// ===== EDIT =====
async function editPackage(id) {
    const res = await fetch(`${API}/${id}`, { headers: authHeaders });
    const pkg = await res.json();

    packageFormTitle.textContent = 'Edit Package';
    packageIdInput.value    = pkg.package_id;
    titleInput.value        = pkg.title;
    destinationInput.value  = pkg.destination;
    startDateInput.value    = pkg.start_date ? pkg.start_date.slice(0, 10) : '';
    endDateInput.value      = pkg.end_date   ? pkg.end_date.slice(0, 10)   : '';
    descriptionInput.value  = pkg.description;
    priceInput.value        = pkg.price;

    itineraryList.innerHTML = '';
    if (pkg.itinerary_items && pkg.itinerary_items.length > 0) {
        pkg.itinerary_items.forEach(item => addItineraryItem(item.title, item.description));
    } else {
        addItineraryItem();
    }

    cancelEditBtn.style.display = 'inline-block';
    openPackageModal();
}

// ===== DELETE =====
async function deletePackage(id) {
    if (!confirm('Delete this package?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders });
    loadPackages(currentPage);
}

// ===== RESET =====
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
    const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const createdOn = `${year}-${month}-${day}`;

    const body = {
        title: titleInput.value,
        destination: destinationInput.value,
        start_date: startDateInput.value,
        end_date: endDateInput.value,
        description: descriptionInput.value,
        created_on: createdOn,
        price: priceInput.value,
        itinerary_items
    };

    const id     = packageIdInput.value;
    const method = id ? 'PUT' : 'POST';
    const url    = id ? `${API}/${id}` : API;

    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(body) });
    const data = await res.json();
    alert(data.message);
    closePackageModal();
    loadPackages(currentPage);
});

loadPackages();
addItineraryItem();
