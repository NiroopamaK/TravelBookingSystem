// ================= GLOBAL USER =================
let currentUser = null;        // session object
let fullUserProfile = null;    // full user data for prefill only

document.addEventListener("DOMContentLoaded", async () => {
  await fetchCurrentUser();       // 🔥 session info
  await fetchFullUserProfile();   // 🔥 full profile for prefill
  initProfileForm();
  initPasswordForm();
  initProfileImageUpload();
  initLogout();
  initDashboardNavigation();
});

// ================= FETCH CURRENT USER (SESSION) =================
async function fetchCurrentUser() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) throw new Error("Not authenticated");

    currentUser = await res.json();
    console.log("SESSION USER:", currentUser);

  } catch (err) {
    console.error("Session fetch failed:", err);
    window.location.href = "/"; // redirect to login if not logged in
  }
}

// ================= FETCH FULL USER PROFILE =================
async function fetchFullUserProfile() {
  try {
    const res = await fetch("/getProfile", { credentials: "include" });
    if (!res.ok) throw new Error("Could not fetch full profile");

    fullUserProfile = await res.json();
    console.log("FULL USER PROFILE:", fullUserProfile);

    prefillProfileForm();
  } catch (err) {
    console.error("Full profile fetch failed:", err);
  }
}

// ================= PROFILE FORM =================
function initProfileForm() {
  const firstName = document.getElementById("editFirstName");
  const lastName = document.getElementById("editLastName");
  const telephone = document.getElementById("editTelephone");
  const address = document.getElementById("editAddress");
  const saveProfileBtn = document.getElementById("saveProfileBtn");

  const initialValues = {
    firstName: firstName?.value || "",
    lastName: lastName?.value || "",
    telephone: telephone?.value || "",
    address: address?.value || ""
  };

  if (saveProfileBtn) saveProfileBtn.disabled = true;

  // Enable editing on click
  document.querySelectorAll(".input-edit").forEach(section => {
    section.addEventListener("click", e => {
      if (!e.target.closest(".edit-icon")) return;
      const field = section.querySelector("input, textarea");
      if (!field) return;

      field.disabled = false;
      field.focus();
      field.style.border = "1px solid #2d89ef";
      field.style.background = "#fff";

      const rules = section.querySelector(".rules");
      if (rules) rules.classList.add("hidden");
    });
  });

  // Validate profile
  function validateProfile() {
    if (!firstName || !lastName || !telephone || !address) return;

    const phoneRegex = /^[0-9]{7,12}$/;
    const firstValid = firstName.value.trim().length >= 1;
    const lastValid = lastName.value.trim().length >= 1;
    const phoneValid = phoneRegex.test(telephone.value.trim());
    const addressValid = address.value.trim().length >= 5;

    toggleRule("editFirstNameRules", firstValid, firstName);
    toggleRule("editLastNameRules", lastValid, lastName);
    toggleRule("editTelephoneRules", phoneValid, telephone);
    toggleRule("editAddressRules", addressValid, address);

    const changed =
      firstName.value !== initialValues.firstName ||
      lastName.value !== initialValues.lastName ||
      telephone.value !== initialValues.telephone ||
      address.value !== initialValues.address;

    if (saveProfileBtn)
      saveProfileBtn.disabled = !(firstValid && lastValid && phoneValid && addressValid && changed);
  }

  function toggleRule(id, valid, field) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("hidden", valid || field.disabled);
  }

  [firstName, lastName, telephone, address].forEach(f => f?.addEventListener("input", validateProfile));

  document.getElementById("profileForm")?.addEventListener("submit", () => {
    document.querySelectorAll("#profileForm input, #profileForm textarea").forEach(f => f.disabled = false);
  });
}

// ================= PREFILL FORM =================
function prefillProfileForm() {
  if (!fullUserProfile) return;
  document.getElementById("editFirstName").value = fullUserProfile.first_name || "";
  document.getElementById("editLastName").value = fullUserProfile.last_name || "";
  document.getElementById("editTelephone").value = fullUserProfile.telephone || "";
  document.getElementById("editAddress").value = fullUserProfile.address || "";
}

// ================= PASSWORD FORM =================
function initPasswordForm() {
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const savePasswordBtn = document.getElementById("savePasswordBtn");
  const passwordRules = document.getElementById("passwordRules");
  const confirmRules = document.getElementById("password2Rules");
  const profileSection = document.getElementById("profileSection");
  const passwordSection = document.getElementById("passwordSection");

  if (savePasswordBtn) savePasswordBtn.disabled = true;

  document.getElementById("changePasswordBtn")?.addEventListener("click", () => {
    if (profileSection) profileSection.style.display = "none";
    if (passwordSection) passwordSection.style.display = "block";

    password.value = "";
    confirmPassword.value = "";
    passwordRules?.classList.add("hidden");
    confirmRules?.classList.add("hidden");
    if (savePasswordBtn) savePasswordBtn.disabled = true;
  });

  document.getElementById("backToProfileBtn")?.addEventListener("click", () => {
    if (passwordSection) passwordSection.style.display = "none";
    if (profileSection) profileSection.style.display = "block";
  });

  // Password validation
  let passwordValid = false;
  let confirmValid = false;

  password?.addEventListener("input", () => {
    passwordRules?.classList.remove("hidden");
    validatePassword();
  });

  confirmPassword?.addEventListener("input", () => {
    confirmRules?.classList.remove("hidden");
    validateConfirmPassword();
  });

  function validatePassword() {
    if (!password) return;
    const pass = password.value;

    const lengthValid = pass.length >= 8;
    const upperValid = /[A-Z]/.test(pass);
    const lowerValid = /[a-z]/.test(pass);
    const numberValid = /\d/.test(pass);
    const specialValid = /[\W_]/.test(pass);

    togglePasswordRule("ruleLength", lengthValid);
    togglePasswordRule("ruleUpper", upperValid);
    togglePasswordRule("ruleLower", lowerValid);
    togglePasswordRule("ruleNumber", numberValid);
    togglePasswordRule("ruleSpecial", specialValid);

    passwordValid = lengthValid && upperValid && lowerValid && numberValid && specialValid;

    if (confirmPassword.value.length > 0) validateConfirmPassword();
    updateSavePasswordBtn();
  }

  function validateConfirmPassword() {
    if (!password || !confirmPassword) return;
    confirmValid = password.value === confirmPassword.value && confirmPassword.value !== "";
    if (confirmRules) confirmRules.classList.toggle("hidden", confirmValid);
    updateSavePasswordBtn();
  }

  function updateSavePasswordBtn() {
    if (!savePasswordBtn) return;
    savePasswordBtn.disabled = !(passwordValid && confirmValid);
  }

  function togglePasswordRule(id, valid) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle("valid", valid);
    el.classList.toggle("invalid", !valid);
    el.classList.remove("hidden");
  }
}

// ================= PROFILE IMAGE UPLOAD =================
function initProfileImageUpload() {
  const profileUpload = document.getElementById("profileUpload");
  profileUpload?.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById("sidebarProfilePic").src = e.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("profile_picture", file);

    fetch("/profile/upload-picture", {
      method: "POST",
      body: formData,
      credentials: "include" // 🔥 session required
    })
      .then(res => res.json())
      .then(data => console.log("Upload success:", data))
      .catch(err => console.error("Upload error:", err));
  });
}

// ================= LOGOUT =================
function initLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}

// ================= DASHBOARD NAVIGATION =================
function initDashboardNavigation() {
  const dashboardBtn = document.getElementById("dashboardBtn");
  dashboardBtn?.addEventListener("click", () => {
    const role = currentUser?.role;

    switch (role) {
      case "ADMIN":
        window.location.href = "/admin/adminDashboard";
        break;
      case "TRAVELLER":
        window.location.href = "/traveller/dashboard";
        break;
      case "TRAVEL_AGENT":
        window.location.href = "/agent/agentDashboard";
        break;
      default:
        window.location.href = "/";
    }
  });
}