let allBookings = [];
let currentPage = 1;
let currentLimit = 5;
let totalPages = 1;

// ================= AUTH CHECK =================
async function ensureAuthenticated() {
  console.log("Fetching current user from session...");
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) throw new Error("Not authenticated");

    console.log("User authenticated");
  } catch (err) {
    console.error("User fetch failed:", err);
    alert("Please log in.");
    window.location.href = "/";
  }
}

// ================= HELPERS =================
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function renderStats(bookings) {
  const upcomingEl = document.getElementById("upcomingCount");
  const activeEl = document.getElementById("activeCount");
  const completedEl = document.getElementById("completedCount");

  const upper = bookings.map(b => String(b.status || "").toUpperCase());

  const upcoming = upper.filter(s => s === "PENDING").length;
  const active = upper.filter(s => s === "CONFIRMED" || s === "ACTIVE").length;
  const completed = upper.filter(s => s === "COMPLETED").length;

  if (upcomingEl) upcomingEl.textContent = String(upcoming);
  if (activeEl) activeEl.textContent = String(active);
  if (completedEl) completedEl.textContent = String(completed);
}

function renderTable(bookings) {
  const tbody = document.getElementById("bookingsTbody");
  if (!tbody) return;

  if (!bookings.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="padding:16px;">No bookings yet.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const pkg = b.package_name || `Package #${b.package_id}`;
    const dest = b.destination || "-";
    const status = b.status || "PENDING";

    return `
      <tr>
        <td>${escapeHtml(pkg)}</td>
        <td>${escapeHtml(dest)}</td>
        <td>${escapeHtml(status)}</td>
        <td class="table-right">
          <button class="btn" onclick="viewPackage(${b.package_id})">View</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderPagination() {
  const container = document.getElementById("bookingsPagination");
  if (!container) return;

  if (!allBookings.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="pagination-controls">
      <button class="page-btn" onclick="changeBookingsPage(${currentPage - 1})" ${currentPage <= 1 ? "disabled" : ""}>&laquo; Prev</button>
      <span class="page-info">Page ${currentPage} of ${totalPages}</span>
      <button class="page-btn" onclick="changeBookingsPage(${currentPage + 1})" ${currentPage >= totalPages ? "disabled" : ""}>Next &raquo;</button>
    </div>
    <div class="pagination-limit">
      <span>Show</span>
      <select class="limit-select" onchange="changeBookingsLimit(this.value)">
        ${[5, 10, 25, 50].map(n => `<option value="${n}" ${n === currentLimit ? "selected" : ""}>${n}</option>`).join("")}
      </select>
      <span>per page</span>
    </div>
  `;
}

function updateBookingsView() {
  totalPages = Math.max(1, Math.ceil(allBookings.length / currentLimit));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * currentLimit;
  const end = start + currentLimit;
  const pageItems = allBookings.slice(start, end);

  renderTable(pageItems);
  renderPagination();
}

function changeBookingsPage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  updateBookingsView();
}

function changeBookingsLimit(val) {
  currentLimit = parseInt(val, 10);
  currentPage = 1;
  updateBookingsView();
}

// ================= VIEW MODAL =================
const viewPackageModal = document.getElementById('viewPackageModal');
const closeViewPackageModalBtn = document.getElementById('closeViewPackageModalBtn');

function closeViewPackageModal() {
  viewPackageModal.classList.remove('active');
}

closeViewPackageModalBtn?.addEventListener('click', closeViewPackageModal);
viewPackageModal?.addEventListener('click', (e) => {
  if (e.target === viewPackageModal) closeViewPackageModal();
});

async function viewPackage(id) {
  try {
    const res = await fetch(`/traveller/package/${id}`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Failed to fetch package');

    const pkg = await res.json();

    const fmt = d => d ? new Date(d).toLocaleDateString('en-GB') : '-';

    document.getElementById('viewPkgTitle').textContent = pkg.title;
    document.getElementById('viewPkgDestination').textContent = pkg.destination;
    document.getElementById('viewPkgStartDate').textContent = fmt(pkg.start_date);
    document.getElementById('viewPkgEndDate').textContent = fmt(pkg.end_date);
    document.getElementById('viewPkgPrice').textContent =
      pkg.price ? '£' + Number(pkg.price).toLocaleString() : '-';
    document.getElementById('viewPkgDescription').textContent =
      pkg.description || '-';

    const itineraryEl = document.getElementById('viewPkgItinerary');
    itineraryEl.innerHTML = '';

    if (pkg.itinerary_items && pkg.itinerary_items.length > 0) {
      pkg.itinerary_items.forEach((item) => {
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

    document.getElementById('viewPkgBookingBtn').href =
      `/traveller/booking/${pkg.package_id}`;

    viewPackageModal.classList.add('active');
  } catch (err) {
    console.error(err);
    alert('Failed to load package details');
  }
}

// ================= LOAD BOOKINGS =================
async function loadBookings() {
  console.log("Loading bookings for session user...");

  try {
    const res = await fetch("/bookings/getBookingDetails", {
      credentials: "include"
    });

    const json = await res.json();

    console.log("Bookings API response:", json);

    if (!res.ok || !json.success) {
      console.error("Bookings API error:", json);
      return;
    }

    allBookings = json.data || [];

    renderStats(allBookings);
    updateBookingsView();
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

// ================= INIT =================
(async function init() {
  console.log("traveller_dashboard.js INIT");

  await ensureAuthenticated();
  await loadBookings();
})();