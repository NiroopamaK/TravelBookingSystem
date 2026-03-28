console.log("traveller_booking.js loaded ✅");

// ================= HELPERS =================
function formatGBP(value) {
  const num = Number(value) || 0;
  return `£ ${num.toFixed(2)}`;
}

// ================= GET PACKAGE ID FROM PATH =================
function getPackageIdFromPath() {
  const pathParts = window.location.pathname.split("/"); // ["", "traveller", "booking", "1"]
  return pathParts[pathParts.length - 1];
}

// ================= PRICE CALCULATION =================
function getPricePerPerson() {
  const el = document.getElementById("pricePerPerson");
  if (!el) return 0;
  return Number(el.dataset.price) || 0;
}

function updateSummary() {
  const people = Number(document.getElementById("people")?.value) || 1;
  const pricePerPerson = getPricePerPerson();
  const total = people * pricePerPerson;

  const peopleOut = document.getElementById("peopleOut");
  const priceOut = document.getElementById("pricePerPersonOut");
  const totalOut = document.getElementById("totalOut");

  if (peopleOut) peopleOut.textContent = String(people);
  if (priceOut) priceOut.textContent = formatGBP(pricePerPerson);
  if (totalOut) totalOut.textContent = formatGBP(total);
}

// ================= LOAD PACKAGE DETAILS =================
async function loadPackageDetails() {
  const packageId = getPackageIdFromPath();
  if (!packageId) {
    console.error("No packageId found in URL");
    return;
  }

  try {
    const res = await fetch(`/traveller/booking/${packageId}/data`, {
      credentials: "include"
    });

    if (!res.ok) throw new Error(`Failed to fetch package: ${res.status}`);
    const json = await res.json();
    const pkg = json.data;  // ✅ extract the actual package

    console.log("Package loaded:", pkg);

    const packageInput = document.getElementById("package_id");
    if (packageInput) packageInput.value = pkg.package_id;

    const titleEl = document.getElementById("packageTitle");
    if (titleEl) titleEl.textContent = pkg.title || "N/A";

    const destEl = document.getElementById("packageDestination");
    if (destEl) destEl.textContent = pkg.destination || "N/A";

    const datesEl = document.getElementById("packageDates");
    const displayDatesEl = document.getElementById("displayDates");
    const startDate = pkg.start_date || "-";
    const endDate = pkg.end_date || "-";

    if (datesEl) datesEl.textContent = `${startDate} - ${endDate}`;
    if (displayDatesEl) displayDatesEl.textContent = `${startDate} - ${endDate}`;

    // handle price safely
    const priceEl = document.getElementById("pricePerPerson");
    const price = Number(pkg.price) || 0;
    if (priceEl) {
      priceEl.dataset.price = price;
      priceEl.textContent = `£ ${price.toFixed(2)}`;
    }

    // update summary fields
    updateSummary();

  } catch (err) {
    console.error("Error loading package:", err);
  }
}

// ================= HANDLE FORM SUBMISSION =================
async function handleBookingSubmit(e) {
  e.preventDefault();

  const packageId = document.getElementById("package_id")?.value;
  const people = Number(document.getElementById("people")?.value) || 1;
  const notes = document.getElementById("notes")?.value || "";
  const pricePerPerson = getPricePerPerson();
  const total = people * pricePerPerson;

  const booking = {
    package_id: Number(packageId),
    packsize: people,
    additional_notes: notes,
    total_price: total
  };

  try {
    const res = await fetch("/bookings/createBooking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(booking)
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        alert("Session expired. Please log in again.");
        window.location.href = "/";
        return;
      }

      const errData = await res.json();
      console.error(errData);
      alert("Failed to submit booking request.");
      return;
    }

    const successBox = document.getElementById("successBox");
    if (successBox) successBox.style.display = "block";

    const form = document.getElementById("bookingForm");
    if (form) form.style.display = "none";

  } catch (err) {
    console.error(err);
    alert("Network error.");
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  // Load package details
  await loadPackageDetails();

  // Update summary when people count changes
  const peopleInput = document.getElementById("people");
  if (peopleInput) peopleInput.addEventListener("input", updateSummary);

  // Handle form submission
  const form = document.getElementById("bookingForm");
  if (form) form.addEventListener("submit", handleBookingSubmit);
});