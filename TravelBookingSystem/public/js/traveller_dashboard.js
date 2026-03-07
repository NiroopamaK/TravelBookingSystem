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

async function loadBookings() {
  const payload = getTokenPayload();
  if (!payload) {
    console.log("No token found");
    return;
  }

  try {
    const response = await fetch(`/bookings/getBookingsByUser/${payload.user_id}`);
    const data = await response.json();
    console.log("Bookings:", data);

    // later: render into table (після цього етапу)
  } catch (error) {
    console.error("Error fetching bookings:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadBookings);