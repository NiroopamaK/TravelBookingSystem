// ================= FORGOT PASSWORD TOGGLE =================
function showForgotPassword() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("forgotPasswordForm").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("forgotPasswordForm").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
}

// ================= EMAIL VERIFICATION =================
new EmailVerification({
  emailInput: "email",
  codeInput: "emailCode",
  sendBtn: "sendCodeBtn",
  validateBtn: "validateCodeBtn",
  resendBtn: "resendCodeBtn",
  afterCodeSection: "afterCodeSent",
  successSection: "passwordSection",
  timerText: "timerText",
  timerElement: "timer",
  message: "validationMessage"
});

// ================= LOGIN =================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include" // 🔥 SESSION REQUIRED
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // ✅ Fetch current user from session
    const meRes = await fetch("/api/auth/me", { credentials: "include" });
    const currentUser = await meRes.json();
    console.log("LOGGED IN USER:", currentUser);

    if (!currentUser || !currentUser.role) {
      alert("Login failed: No user data");
      return;
    }

    // Role-based redirect
    switch (currentUser.role) {
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

  } catch (err) {
    alert("Login request failed: " + err.message);
  }
});

// ================= RESET PASSWORD =================
document.getElementById("forgotPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("password2").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include" // optional
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password reset successful! Please login.");
      showLogin();
    } else {
      alert(data.message || "Password reset failed");
    }
  } catch (err) {
    alert("Request failed: " + err.message);
  }
});

// ================= LOGIN BUTTON VALIDATION =================
document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");

  function checkLoginFields() {
    if (!emailInput || !passwordInput || !loginBtn) return;
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    loginBtn.disabled = !(email && password);
  }

  emailInput.addEventListener("input", checkLoginFields);
  passwordInput.addEventListener("input", checkLoginFields);
  checkLoginFields();
});

// ================= RESET PASSWORD VALIDATION =================
document.addEventListener("DOMContentLoaded", () => {
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("password2");
  const resetBtn = document.getElementById("resetBtn");

  const ruleLength = document.getElementById("ruleLength");
  const ruleUpper = document.getElementById("ruleUpper");
  const ruleLower = document.getElementById("ruleLower");
  const ruleNumber = document.getElementById("ruleNumber");
  const ruleSpecial = document.getElementById("ruleSpecial");

  if (!password || !confirmPassword || !resetBtn) return;

  function validatePassword() {
    const pass = password.value;
    const confirm = confirmPassword.value;

    const lengthValid = pass.length >= 8;
    const upperValid = /[A-Z]/.test(pass);
    const lowerValid = /[a-z]/.test(pass);
    const numberValid = /\d/.test(pass);
    const specialValid = /[\W_]/.test(pass);

    toggleRule(ruleLength, lengthValid);
    toggleRule(ruleUpper, upperValid);
    toggleRule(ruleLower, lowerValid);
    toggleRule(ruleNumber, numberValid);
    toggleRule(ruleSpecial, specialValid);

    resetBtn.disabled = !(lengthValid && upperValid && lowerValid && numberValid && specialValid && pass === confirm);
  }

  function toggleRule(element, valid) {
    if (valid) element.classList.add("valid");
    else element.classList.remove("valid");
  }

  password.addEventListener("input", () => {
    document.getElementById("passwordRules").classList.remove("hidden");
    validatePassword();
  });
  password.addEventListener("input", validatePassword);
  confirmPassword.addEventListener("input", validatePassword);
});

// ================= CLEAR FIELDS ON LOAD =================
window.addEventListener("load", () => {
  const loginForm = document.getElementById("loginForm");
  const forgotForm = document.getElementById("forgotPasswordForm");

  if (loginForm) loginForm.reset();
  if (forgotForm) forgotForm.reset();

  const loginBtn = document.getElementById("loginBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (loginBtn) loginBtn.disabled = true;
  if (resetBtn) resetBtn.disabled = true;
});