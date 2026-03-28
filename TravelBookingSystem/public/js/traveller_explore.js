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
          <a class="btn" href="/traveller/booking/${pkg.package_id}">
            Request Booking
          </a>
        </div>
      </div>
    `).join("");

    console.log("Packages rendered:", packages.length);

  } catch (err) {
    console.error("Error loading packages:", err);
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  loadPackages();
});