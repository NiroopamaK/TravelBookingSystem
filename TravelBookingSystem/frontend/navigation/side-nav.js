console.log("sidenav is running");

document.addEventListener("DOMContentLoaded", renderSidebar);

function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  console.log("Decoded role:", payload.role);
  return payload.role; // 'ADMIN', 'TRAVELLER', or 'TRAVEL_AGENT'
}

const menus = {
  ADMIN: [
    { name: "Analytics", link: "../admin/analytics.html" },
    { name: "Agents", link: "../admin/agents.html" },
    { name: "Travellers", link: "../admin/travellers.html" },
    { name: "Packages", link: "../admin/packages.html" },
  ],
  TRAVELLER: [
    { name: "Dashboard", link: "../traveller/traveller.dashboard.html" },
    { name: "Explore", link: "../traveller/traveller.explore.html" },
  ],
  TRAVEL_AGENT: [
    { name: "Packages", link: "../agent/my-packages.html" },
    { name: "Bookings", link: "../agent/agent-bookings.html" },
    { name: "Trips", link: "../agent/my-trips.html" },
  ],
};

// Load page content into .dashboard-content
async function loadPage(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Page not found: " + path);

    const html = await response.text();
    document.querySelector(".dashboard-content").innerHTML = html;
  } catch (err) {
    document.querySelector(".dashboard-content").innerHTML =
      `<p style="color:red;">${err.message}</p>`;
  }
}

// Highlight active sidebar item
function setActive(selectedLi) {
  document.querySelectorAll("#sidebar li").forEach((li) =>
    li.classList.remove("active")
  );
  selectedLi.classList.add("active");
}

// Render sidebar based on user role
function renderSidebar() {
  const role = getUserRole();
  const sidebar = document.getElementById("sidebar");

  if (!role || !menus[role]) {
    sidebar.innerHTML = "<p>No access</p>";
    return;
  }

  const ul = document.createElement("ul");

  menus[role].forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.name;

    li.addEventListener("click", () => {
      setActive(li);
      loadPage(item.link); // SPA behavior
    });

    ul.appendChild(li);
  });

  sidebar.appendChild(ul);

  // ✅ Load first menu item by default
  if (menus[role].length > 0) {
    setActive(ul.children[0]);
    loadPage(menus[role][0].link);
  }
}