const API = '/api/agent/packages';

const packageModal       = document.getElementById('packageModal');
const openPackageModalBtn = document.getElementById('openPackageModalBtn');
const closePackageModalBtn = document.getElementById('closePackageModalBtn');
const packageForm        = document.getElementById('packageForm');
const packageFormTitle   = document.getElementById('packageFormTitle');
const packageIdInput     = document.getElementById('packageId');
const titleInput         = document.getElementById('title');
const destinationInput   = document.getElementById('destination');
const startDateInput     = document.getElementById('startDate');
const endDateInput       = document.getElementById('endDate');
const descriptionInput   = document.getElementById('description');
const priceInput         = document.getElementById('price');
const itineraryList      = document.getElementById('itineraryList');
const addItineraryBtn    = document.getElementById('addItineraryBtn');
const cancelEditBtn      = document.getElementById('cancelEditBtn');
const packagesBody       = document.getElementById('packagesBody');

/* ===== MODAL ===== */
function openModal() {
    packageModal.classList.add('active');
}

function closeModal() {
    packageModal.classList.remove('active');
    resetForm();
}

openPackageModalBtn.addEventListener('click', () => {
    packageFormTitle.textContent = 'Add New Package';
    cancelEditBtn.style.display = 'none';
    openModal();
});

closePackageModalBtn.addEventListener('click', closeModal);

packageModal.addEventListener('click', (e) => {
    if (e.target === packageModal) closeModal();
});

/* ===== ITINERARY ===== */
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

/* ===== LOAD PACKAGES ===== */
async function loadPackages() {
    const res = await fetch(API);
    const packages = await res.json();
    packagesBody.innerHTML = '';
    packages.forEach(pkg => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pkg.package_id}</td>
            <td>${pkg.title}</td>
            <td>${pkg.destination}</td>
            <td>${pkg.start_date ? pkg.start_date.slice(0, 10) : ''}</td>
            <td>${pkg.end_date ? pkg.end_date.slice(0, 10) : ''}</td>
            <td>${pkg.description}</td>
            <td>${pkg.price}</td>
            <td>
                <button class="btn-edit" onclick="editPackage(${pkg.package_id})">Edit</button>
                <button class="btn-delete" onclick="deletePackage(${pkg.package_id})">Delete</button>
            </td>
        `;
        packagesBody.appendChild(tr);
    });
}

/* ===== EDIT ===== */
async function editPackage(id) {
    const res = await fetch(`${API}/${id}`);
    const pkg = await res.json();

    packageFormTitle.textContent = 'Edit Package';
    packageIdInput.value = pkg.package_id;
    titleInput.value = pkg.title;
    destinationInput.value = pkg.destination;
    startDateInput.value = pkg.start_date ? pkg.start_date.slice(0, 10) : '';
    endDateInput.value = pkg.end_date ? pkg.end_date.slice(0, 10) : '';
    descriptionInput.value = pkg.description;
    priceInput.value = pkg.price;

    itineraryList.innerHTML = '';
    if (pkg.itinerary_items && pkg.itinerary_items.length > 0) {
        pkg.itinerary_items.forEach(item => addItineraryItem(item.title, item.description));
    } else {
        addItineraryItem();
    }

    cancelEditBtn.style.display = 'inline-block';
    openModal();
}

/* ===== DELETE ===== */
async function deletePackage(id) {
    if (!confirm('Delete this package?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    loadPackages();
}

/* ===== RESET ===== */
function resetForm() {
    packageForm.reset();
    packageIdInput.value = '';
    packageFormTitle.textContent = 'Add New Package';
    cancelEditBtn.style.display = 'none';
    itineraryList.innerHTML = '';
    addItineraryItem();
}

cancelEditBtn.addEventListener('click', resetForm);

/* ===== SUBMIT ===== */
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

    const id = packageIdInput.value;
    const method = id ? 'PUT' : 'POST';
    const url    = id ? `${API}/${id}` : API;

    const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    alert(data.message);
    closeModal();
    loadPackages();
});

loadPackages();
addItineraryItem();
