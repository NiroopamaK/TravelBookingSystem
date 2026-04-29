console.log("traveller_explore.js loaded");

let allPackages = [];
let filteredPackages = [];
let currentPage = 1;
let currentLimit = 6;
let totalPages = 1;

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function normaliseText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalisePrice(value) {
  if (value === null || value === undefined || value === "") return null;
  return Number(String(value).replace(",", "."));
}

function getFilteredPackages() {
  const searchValue = normaliseText(document.getElementById("searchInput")?.value);
  const minPrice = normalisePrice(document.getElementById("minPrice")?.value);
  const maxPrice = normalisePrice(document.getElementById("maxPrice")?.value);

  return allPackages.filter(pkg => {
    const title = normaliseText(pkg.title);
    const destination = normaliseText(pkg.destination);
    const price = normalisePrice(pkg.price);

    const matchesSearch =
      !searchValue ||
      title.includes(searchValue) ||
      destination.includes(searchValue);

    const matchesMin =
      minPrice === null || (price !== null && price >= minPrice);

    const matchesMax =
      maxPrice === null || (price !== null && price <= maxPrice);

    return matchesSearch && matchesMin && matchesMax;
  });
}

function renderPackages(packages) {
  const container = document.getElementById("cardsContainer");
  if (!container) return;

  if (!packages.length) {
    container.innerHTML = "<p>No packages found</p>";
    return;
  }

  container.innerHTML = packages.map(pkg => `
    <div class="package-card">
      <img class="card-img" src="/assets/packages.png" alt="Package image" />
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
}

function renderPagination() {
  const container = document.getElementById("explorePagination");
  if (!container) return;

  if (!filteredPackages.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="pagination-controls">
      <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage <= 1 ? "disabled" : ""}>&laquo; Prev</button>
      <span class="page-info">Page ${currentPage} of ${totalPages}</span>
      <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage >= totalPages ? "disabled" : ""}>Next &raquo;</button>
    </div>
    <div class="pagination-limit">
      <span>Show</span>
      <select class="limit-select" onchange="changeLimit(this.value)">
        ${[3, 6, 9, 12].map(n => `<option value="${n}" ${n === currentLimit ? "selected" : ""}>${n}</option>`).join("")}
      </select>
      <span>per page</span>
    </div>
  `;
}

function updateExploreView() {
  filteredPackages = getFilteredPackages();
  totalPages = Math.max(1, Math.ceil(filteredPackages.length / currentLimit));

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * currentLimit;
  const end = start + currentLimit;
  const pageItems = filteredPackages.slice(start, end);

  renderPackages(pageItems);
  renderPagination();
}

function applyFilters() {
  currentPage = 1;
  updateExploreView();
}

function changePage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  updateExploreView();
}

function changeLimit(val) {
  currentLimit = parseInt(val, 10);
  currentPage = 1;
  updateExploreView();
}

async function loadPackages() {
  try {
    const res = await fetch("/traveller/explore/data", {
      credentials: "include"
    });

    const json = await res.json();
    allPackages = json.data || [];
    updateExploreView();
  } catch (err) {
    console.error("Error loading packages:", err);
  }
}

// ================= VIEW MODAL =================
const viewPackageModal = document.getElementById("viewPackageModal");
const closeViewPackageModalBtn = document.getElementById("closeViewPackageModalBtn");

function closeViewPackageModal() {
  viewPackageModal.classList.remove("active");
}

closeViewPackageModalBtn?.addEventListener("click", closeViewPackageModal);
viewPackageModal?.addEventListener("click", (e) => {
  if (e.target === viewPackageModal) closeViewPackageModal();
});

async function viewPackage(id) {
  try {
    const res = await fetch(`/traveller/package/${id}`, {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Failed to fetch package");

    const pkg = await res.json();

    const fmt = d => d ? new Date(d).toLocaleDateString("en-GB") : "-";

    document.getElementById("viewPkgTitle").textContent = pkg.title || "-";
    document.getElementById("viewPkgDestination").textContent = pkg.destination || "-";
    document.getElementById("viewPkgStartDate").textContent = fmt(pkg.start_date);
    document.getElementById("viewPkgEndDate").textContent = fmt(pkg.end_date);
    document.getElementById("viewPkgPrice").textContent =
      pkg.price ? "£" + Number(String(pkg.price).replace(",", ".")).toLocaleString("en-GB") : "-";
    document.getElementById("viewPkgDescription").textContent =
      pkg.description || "-";

    const itineraryEl = document.getElementById("viewPkgItinerary");
    itineraryEl.innerHTML = "";

    if (pkg.itinerary_items && pkg.itinerary_items.length > 0) {
      pkg.itinerary_items.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.description)}</p>
        `;
        itineraryEl.appendChild(li);
      });
    } else {
      itineraryEl.innerHTML = "<li>No itinerary available</li>";
    }

    document.getElementById("viewPkgBookingBtn").href =
      `/traveller/booking/${pkg.package_id}`;

    viewPackageModal.classList.add("active");
  } catch (err) {
    console.error(err);
    alert("Failed to load package details");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput")?.addEventListener("input", applyFilters);
  document.getElementById("minPrice")?.addEventListener("input", applyFilters);
  document.getElementById("maxPrice")?.addEventListener("input", applyFilters);

  loadPackages();
});