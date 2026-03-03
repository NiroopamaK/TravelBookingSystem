document.addEventListener("DOMContentLoaded", renderSidebar);

function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
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
    { name: "Explore", link: "../traveller/explore.html" },
    { name: "My Bookings", link: "../traveller/bookings.html" },
  ],
  TRAVEL_AGENT: [
    { name: "Dashboard", link: "../travel-agent/agent.dashboard.html" },
    { name: "Packages", link: "../travel-agent/agent.packages.html" },
    { name: "Bookings", link: "#" },
  ],
};

// Load page content into .dashboard-content (SPA mode)
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

// Highlight active sidebar item (SPA mode)
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

  // SPA mode: page has a .dashboard-content container to load into
  const isSPA = !!document.querySelector(".dashboard-content");
  const currentPath = window.location.pathname;
  const ul = document.createElement("ul");

  menus[role].forEach((item) => {
    const li = document.createElement("li");

    if (isSPA) {
      li.textContent = item.name;
      li.addEventListener("click", () => {
        setActive(li);
        loadPage(item.link);
      });
    } else {
      const a = document.createElement("a");
      a.textContent = item.name;
      a.href = item.link;
      li.appendChild(a);

      // Mark the current page as active
      const linkFilename = item.link.split("/").pop();
      if (linkFilename !== "#" && currentPath.includes(linkFilename)) {
        li.classList.add("active");
      }
    }

    ul.appendChild(li);
  });

  sidebar.appendChild(ul);

  // Auto-load first item in SPA mode
  if (isSPA && menus[role].length > 0) {
    setActive(ul.children[0]);
    loadPage(menus[role][0].link);
  }
}
