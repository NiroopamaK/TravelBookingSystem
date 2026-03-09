function showForgotPassword() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("forgotPasswordForm").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("forgotPasswordForm").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
}

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


/* ================================
   LOGIN
================================ */

function decodeToken(token) {
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

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {

      localStorage.setItem("token", data.token);

      const payload = decodeToken(data.token);

      if (!payload || !payload.role) {
        alert("Invalid login response");
        return;
      }

      // Role based redirect
      switch (payload.role) {
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

    } else {
      alert(data.message || "Login failed");
    }

  } catch (err) {
    alert("Login request failed: " + err.message);
  }
});


/* ================================
   RESET PASSWORD
================================ */

document
  .getElementById("forgotPasswordForm")
  .addEventListener("submit", async (e) => {

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
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {

        alert("Password reset successful! Please login.");
        window.location.href = "/";

      } else {

        alert(data.message || "Password reset failed");

      }

    } catch (err) {
      alert("Request failed: " + err.message);
    }

});