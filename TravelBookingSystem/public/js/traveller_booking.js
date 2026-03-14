console.log("traveller_booking.js loaded ✅");
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

document.addEventListener("DOMContentLoaded", () => {
  const peopleInput = document.getElementById("people");
  if (peopleInput) peopleInput.addEventListener("input", updateSummary);
  updateSummary();

  const form = document.getElementById("bookingForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = getTokenPayload();
    if (!payload) {
      alert("Please log in again.");
      window.location.href = "/";
      return;
    }

    const packageId = document.getElementById("packageId")?.value;
    const people = Number(document.getElementById("people")?.value) || 1;
    const notes = document.getElementById("notes")?.value || "";
    const pricePerPerson = getPricePerPerson();
    const total = people * pricePerPerson;

    const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const createdOn = `${year}-${month}-${day}`;

    const booking = {
      user_id: payload.user_id,
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
        body: JSON.stringify(booking)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error(data);
        alert("Failed to submit booking request.");
        return;
      }

      // show success
      document.getElementById("successBox").style.display = "block";
      form.style.display = "none";

    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  });
});