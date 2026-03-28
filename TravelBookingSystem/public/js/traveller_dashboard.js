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
    window.location.href = "/"; // redirect if not logged in
  }
}

// ================= HELPERS =================
function pillClass(status) {
  const s = String(status || "").toUpperCase();
  if (s === "CONFIRMED" || s === "ACTIVE") return "pill pill-active";
  if (s === "COMPLETED") return "pill pill-completed";
  if (s === "PENDING") return "pill pill-pending";
  return "pill pill-active"; 
}

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

  console.log("Stats - Upcoming:", upcoming, "Active:", active, "Completed:", completed);
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
    console.log("No bookings to display.");
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const pkg = b.package_name || `Package #${b.package_id}`;
    const dest = b.destination || "-";
    const status = b.status || "PENDING";
    const viewLink = `/traveller/booking/${b.package_id}`;

    return `
      <tr>
        <td>${escapeHtml(pkg)}</td>
        <td>${escapeHtml(dest)}</td>
        <td>${escapeHtml(status)}</td>
        <td class="table-right">
          <a class="btn" href="${viewLink}">View</a>
        </td>
      </tr>
    `;
  }).join("");

  console.log("Bookings table rendered:", bookings.length, "rows");
}

// ================= LOAD BOOKINGS =================
async function loadBookings() {
  console.log("Loading bookings for session user...");

  try {
    const res = await fetch("/bookings/getBookingsByUser", {
      credentials: "include"
    });
    const json = await res.json();

    console.log("Bookings API response:", json);

    if (!res.ok || !json.success) {
      console.error("Bookings API error:", json);
      return;
    }

    const bookings = json.data || [];
    console.log("Bookings loaded:", bookings);

    renderStats(bookings);
    renderTable(bookings);

  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

// ================= INIT =================
(async function init() {
  console.log("traveller_dashboard.js INIT");

  await ensureAuthenticated(); // validate session only
  console.log("Session validated, now loading bookings...");

  await loadBookings();
})();