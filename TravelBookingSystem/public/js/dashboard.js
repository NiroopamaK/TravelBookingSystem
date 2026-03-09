/*
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
        { name: "Analytics", link: "/analytics" },
        { name: "Users", link: "/users" },
        { name: "Packages", link: "/packages" }
    ],
    TRAVELLER: [
        { name: "Explore", link: "../traveller/traveller.explore.html" },
        { name: "My Bookings", link: "../traveller/bookings.html" }
    ],
    TRAVEL_AGENT: [
        { name: "Packages", link: "/agent/packages" },
        { name: "Bookings", link: "/agent/bookings" },
        { name: "Customers", link: "/agent/customers" }
    ]
};

/* ================================
   LOAD CONTENT (SPA)
================================ */

async function loadPage(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error("Page not found");

        const html = await response.text();
        const content = document.querySelector(".dashboard-content");
        content.innerHTML = html;

        // Remove any previously injected page scripts
        document.querySelectorAll("script[data-page-script]").forEach(s => s.remove());

        // innerHTML doesn't execute scripts — re-create and append them so they run
        content.querySelectorAll("script").forEach(oldScript => {
            const newScript = document.createElement("script");
            newScript.setAttribute("data-page-script", "true");
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
            oldScript.remove();
        });
    } catch (err) {
        document.querySelector(".dashboard-content").innerHTML =
            `<p style="color:red;">${err.message}</p>`;
    }
}

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
  */
