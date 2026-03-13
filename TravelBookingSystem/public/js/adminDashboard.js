document.addEventListener("DOMContentLoaded", async () => {

    try {

        const res = await fetch("/api/admin/stats");
        const stats = await res.json();

        document.getElementById("packages").textContent = stats.packages;
        document.getElementById("bookings").textContent = stats.bookings;
        document.getElementById("agents").textContent = stats.travel_agents;
        document.getElementById("travellers").textContent = stats.travellers;

    } catch (err) {

        console.error("Failed to load stats", err);

    }

});