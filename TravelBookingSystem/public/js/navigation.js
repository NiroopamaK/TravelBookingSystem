document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  renderSidebar();
  initEditProfileLink();
});

function getTokenPayload() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const base64 = token.split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    return JSON.parse(atob(base64));
  } catch (err) {
    console.error("Invalid token");
    return null;
  }
}

function getUserRole() {
  const payload = getTokenPayload();
  return payload ? payload.role : null;
}


//   NAVBAR LOGIC
function initNavbar() {
  const profilePic = document.getElementById("profilePic");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const signOutBtn = document.getElementById("signOutBtn");

  if (!profilePic || !dropdownMenu || !signOutBtn) return;

  // Toggle dropdown
  profilePic.addEventListener("click", () => {
    dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!profilePic.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.style.display = "none";
    }
  });

  // Sign out
  signOutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  });

  // Load user info
  const payload = getTokenPayload();
  if (payload) {
    const nameEl = document.querySelector(".profile-name");
    const roleEl = document.querySelector(".profile-role");

    if (nameEl) nameEl.textContent = payload.first_name || "User";
    if (roleEl) roleEl.textContent = payload.role || "";
  }
}

//   SIDEBAR MENUS
const menus = {
  ADMIN: [
    { name: "Dashboard", link: "/admin/adminDashboard" },
    { name: "Users", link: "/admin/users" },
    { name: "Packages", link: "/admin/packages" }
  ],
  TRAVELLER: [
    { name: "Explore", link: "/traveller/explore" },
    { name: "My Bookings", link: "/traveller/dashboard" }
  ],
  TRAVEL_AGENT: [
    { name: "Dashboard", link: "/agent/agentDashboard" },
    { name: "My Packages", link: "/agent/packages" },
    { name: "Bookings", link: "/agent/bookings" },

  ]
};

function setActive(selectedLi) {
  document.querySelectorAll("#sidebar li").forEach(li => li.classList.remove("active"));
  selectedLi.classList.add("active");
}

function renderSidebar() {
  const role = getUserRole();
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  if (!role || !menus[role]) {
    sidebar.innerHTML = "<p style='padding:20px'>No Access</p>";
    return;
  }

  sidebar.innerHTML = "";
  const ul = document.createElement("ul");

  menus[role].forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.name;

    li.addEventListener("click", () => {
      window.location.href = item.link;
    });

    ul.appendChild(li);
  });

  sidebar.appendChild(ul);

  const currentPath = window.location.pathname;
  const idx = menus[role].findIndex(m => m.link === currentPath);
  if (idx >= 0 && ul.children[idx]) {
    setActive(ul.children[idx]);
  }
}

function initEditProfileLink() {
  const editLink = document.getElementById("editProfileLink");
  if (!editLink) return;

  editLink.addEventListener("click", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not logged in");
      window.location.href = "/";
      return;
    }

    window.location.href = "/editProfile?token=" + token;
  });
}
