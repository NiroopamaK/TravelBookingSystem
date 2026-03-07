function getTokenPayload() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (err) {
    console.error("Invalid token");
    return null;
  }
}

function pillClass(status) {
  const s = String(status || "").toUpperCase();
  if (s === "CONFIRMED" || s === "ACTIVE") return "pill pill-active";
  if (s === "COMPLETED") return "pill pill-completed";
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
    const pkg = b.title || `Package #${b.package_id}`;
    const dest = b.destination || "-";
    const status = b.status || "PENDING";

    const viewLink = `/traveller/booking/${b.package_id}`;

    return `
        <tr>
            <td>${escapeHtml(pkg)}</td>
            <td>${escapeHtml(dest)}</td>
            <td><span class="${pillClass(status)}">${escapeHtml(status)}</span></td>
            <td class="table-right">
                <a class="btn" href="${viewLink}">View</a>
            </td>
        </tr>
    `;
  }).join("");
}

async function loadBookings() {
  const payload = getTokenPayload();
  if (!payload) {
    console.log("No token found");
    return;
  }

  try {
    const res = await fetch(`/bookings/getBookingsByUser/${payload.user_id}`);
    const json = await res.json();

    if (!res.ok || !json.success) {
      console.error("Bookings API error:", json);
      return;
    }

    const bookings = json.data || [];
    console.log("Bookings:", bookings);

    renderStats(bookings);
    renderTable(bookings);

  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadBookings);