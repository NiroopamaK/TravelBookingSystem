// ================= GLOBAL USER =================
let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  await fetchCurrentUser(); // 🔥 MUST HAPPEN FIRST
  initNavbar();
  renderSidebar();
  initEditProfileLink();
});


// ================= FETCH USER FROM SESSION =================
async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include' // 🔥 REQUIRED FOR SESSIONS
    });

    if (!res.ok) throw new Error("Not authenticated");

    currentUser = await res.json();
    console.log("CURRENT USER:", currentUser);

  } catch (err) {
    console.error("User fetch failed:", err);
    window.location.href = "/"; 
  }
}


// ================= NAVBAR =================
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

  // ================= LOGOUT =================
  signOutBtn.addEventListener("click", async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      window.location.href = "/";

    } catch (err) {
      console.error("Logout failed:", err);
    }
  });

  // ================= LOAD USER INFO =================
  if (currentUser) {
    const nameEl = document.querySelector(".profile-name");
    const roleEl = document.querySelector(".profile-role");

    if (nameEl) nameEl.textContent = currentUser.first_name || "User";
    if (roleEl) roleEl.textContent = currentUser.role || "";

    if (profilePic) {
      fetch(`/getProfilePicture`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.path) profilePic.src = data.path;
        })
        .catch(err => console.error("Error fetching profile picture:", err));
    }
  }
}


// ================= SIDEBAR MENUS =================
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
    { name: "Bookings", link: "/agent/bookings" }
  ]
};


// ================= ACTIVE MENU =================
function setActive(selectedLi) {
  document.querySelectorAll("#sidebar li")
    .forEach(li => li.classList.remove("active"));

  selectedLi.classList.add("active");
}


// ================= RENDER SIDEBAR =================
function renderSidebar() {
  const role = currentUser?.role;
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


// ================= EDIT PROFILE =================
function initEditProfileLink() {
  const editLink = document.getElementById("editProfileLink");
  if (!editLink) return;

  editLink.addEventListener("click", function (e) {
    e.preventDefault();

    if (!currentUser) {
      alert("Not logged in");
      window.location.href = "/";
      return;
    }

    window.location.href = "/editProfile";
  });
}