console.log("traveller_booking.js loaded ✅");

let currentUser = null;

// ================= FETCH CURRENT USER (SESSION) =================
async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) throw new Error("Not authenticated");

    currentUser = await res.json();
    console.log("SESSION USER:", currentUser);

  } catch (err) {
    console.error("Session fetch failed:", err);
    alert("Please log in.");
    window.location.href = "/"; // redirect to login if not logged in
  }
}

function formatGBP(value) {
  const num = Number(value) || 0;
  return `£ ${num.toFixed(2)}`;
}

function getPricePerPerson() {
  const el = document.getElementById("pricePerPerson");
  if (!el) return 0;
  const p = el.getAttribute("data-price");
  return Number(p) || 0;
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

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  await fetchCurrentUser();
  if (!currentUser) return; // if not logged in, fetchCurrentUser will redirect

  const peopleInput = document.getElementById("people");
  if (peopleInput) peopleInput.addEventListener("input", updateSummary);
  updateSummary();

  const form = document.getElementById("bookingForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const packageId = document.getElementById("packageId")?.value;
    const people = Number(document.getElementById("people")?.value) || 1;
    const notes = document.getElementById("notes")?.value || "";
    const pricePerPerson = getPricePerPerson();
    const total = people * pricePerPerson;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const createdOn = `${year}-${month}-${day}`;

    const booking = {
      user_id: currentUser.user_id,  // ✅ set from session
      package_id: Number(packageId),
      packsize: people,
      additional_notes: notes,
      created_on: createdOn,
      total_price: total,
      status: "PENDING"
    };

    try {
      const res = await fetch("/bookings/createBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // use session
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

      const data = await res.json();
      document.getElementById("successBox").style.display = "block";
      form.style.display = "none";

    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  });
});