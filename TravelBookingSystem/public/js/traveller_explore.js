console.log("traveller_explore.js loaded");

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

async function loadPackages() {
  console.log("Fetching packages...");

  try {
    const res = await fetch("/traveller/explore/data", {
      credentials: "include"
    });

    const json = await res.json();
    console.log("Packages response:", json);

    const container = document.getElementById("cardsContainer");
    if (!container) return;

    const packages = json.data || [];

    if (!packages.length) {
      container.innerHTML = "<p>No packages available</p>";
      return;
    }

    container.innerHTML = packages.map(pkg => `
      <div class="package-card">
        <img class="card-img" src="/assets/Hawaii.png" alt="Package image" />
        <div class="card-info">
          <h3>${escapeHtml(pkg.title)}</h3>
          <p>📍 ${escapeHtml(pkg.destination)}</p>
          <p>🗓 ${escapeHtml(pkg.start_date)} - ${escapeHtml(pkg.end_date)}</p>
          <p>£ ${escapeHtml(pkg.price)}</p>
          <button class="btn" onclick="viewPackage(${pkg.package_id})">
          View Package
          </button>
        </div>
      </div>
    `).join("");

    console.log("Packages rendered:", packages.length);

  } catch (err) {
    console.error("Error loading packages:", err);
  }
}

// ================= VIEW MODAL =================
const viewPackageModal = document.getElementById('viewPackageModal');
const closeViewPackageModalBtn = document.getElementById('closeViewPackageModalBtn');

function closeViewPackageModal() {
  viewPackageModal.classList.remove('active');
}

closeViewPackageModalBtn.addEventListener('click', closeViewPackageModal);
viewPackageModal.addEventListener('click', (e) => {
  if (e.target === viewPackageModal) closeViewPackageModal();
});

async function viewPackage(id) {
  console.log(id)
  try {
    const res = await fetch(`/traveller/package/${id}`, {
      credentials: 'include'
    });
    console.log(res)
    if (!res.ok) throw new Error('Failed to fetch package');

    const pkg = await res.json();

    const fmt = d =>
      d ? new Date(d).toLocaleDateString('en-GB') : '-';

    // Populate modal
    document.getElementById('viewPkgTitle').textContent = pkg.title;
    document.getElementById('viewPkgDestination').textContent = pkg.destination;
    document.getElementById('viewPkgStartDate').textContent = fmt(pkg.start_date);
    document.getElementById('viewPkgEndDate').textContent = fmt(pkg.end_date);
    document.getElementById('viewPkgPrice').textContent =
      pkg.price ? '£' + Number(pkg.price).toLocaleString() : '-';
    document.getElementById('viewPkgDescription').textContent =
      pkg.description || '-';

    // Itinerary
    const itineraryEl = document.getElementById('viewPkgItinerary');
    itineraryEl.innerHTML = '';

    if (pkg.itinerary_items && pkg.itinerary_items.length > 0) {
      pkg.itinerary_items.forEach((item, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${item.title}</strong>
          <p>${item.description}</p>
        `;
        itineraryEl.appendChild(li);
      });
    } else {
      itineraryEl.innerHTML = '<li>No itinerary available</li>';
    }

    // 🔥 Set booking button link
    document.getElementById('viewPkgBookingBtn').href =
      `/traveller/booking/${pkg.package_id}`;

    // Show modal
    viewPackageModal.classList.add('active');

  } catch (err) {
    console.error(err);
    alert('Failed to load package details');
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadPackages();
});