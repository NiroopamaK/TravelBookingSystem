let countdownInterval;
let timeLeft = 60;
let validationAttempts = 1;
let resendAttempts = 0;
let codeValidated = false;
const MAX_ATTEMPTS = 3;

// Step1 -> Step2
document.getElementById("nextStepBtn").addEventListener("click", () => {
  document.getElementById("signupStep1").classList.add("hidden");
  document.getElementById("signupStep2").classList.remove("hidden");
  resetStep2Inputs();
});

function resetStep2Inputs() {
  document.getElementById("signupPassword").value = "";
  document.getElementById("signupPassword2").value = "";
  document.getElementById("emailCode").value = "";

  document.getElementById("signupPassword").disabled = true;
  document.getElementById("signupPassword2").disabled = true;
  document.getElementById("emailCode").disabled = true;

  document.getElementById("afterCodeSent").classList.add("hidden");
  document.getElementById("passwordSection").classList.add("hidden");

  document.getElementById("sendCodeBtn").style.display = "block";
  validationAttempts = 0;
  resendAttempts = 0;
  codeValidated = false;

  clearInterval(countdownInterval);
}

// Send verification code
document.getElementById("sendCodeBtn").addEventListener("click", async () => {
  const email = document.getElementById("signupEmail").value;
  if (!email) return alert("Please enter an email first!");

  try {
    const res = await fetch("/api/email/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert("Verification code sent!");

      document.getElementById("afterCodeSent").classList.remove("hidden");
      document.getElementById("emailCode").disabled = false;

      document.getElementById("sendCodeBtn").style.display = "none";

      document.getElementById("validateCodeBtn").style.display = "block";
      document.getElementById("resendCodeBtn").classList.add("hidden");

      document.getElementById("timerText").style.display = "block";
      document.getElementById("timerText").textContent =
        "Code expires in ";
      document.getElementById("timerText").innerHTML =
        'Code expires in <span id="timer">60</span>s';

      startTimer();
    } else {
      alert("Failed to send code");
    }
  } catch (err) {
    alert(err.message);
  }
});

// Timer
function startTimer() {
  clearInterval(countdownInterval);

  timeLeft = 60;
  document.getElementById("timer").textContent = timeLeft;

  countdownInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);

      document.getElementById("timerText").textContent =
        "Verification code expired";

      document.getElementById("validateCodeBtn").style.display = "none";

      if (!codeValidated && validationAttempts < MAX_ATTEMPTS) {
        document.getElementById("resendCodeBtn").classList.remove("hidden");
      }
    }
  }, 1000);
}

// Validate code
document
  .getElementById("validateCodeBtn")
  .addEventListener("click", async () => {
    const email = document.getElementById("signupEmail").value;
    const code = document.getElementById("emailCode").value;

    if (!code) return alert("Enter verification code");

    try {
      const res = await fetch("/api/email/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        codeValidated = true;

        clearInterval(countdownInterval);

        document.getElementById("afterCodeSent").classList.add("hidden");
        document
          .getElementById("passwordSection")
          .classList.remove("hidden");

        document.getElementById("signupPassword").disabled = false;
        document.getElementById("signupPassword2").disabled = false;

        document.getElementById("validationMessage").textContent =
          "Email validation successful";
        document.getElementById("validationMessage").style.color = "green";
      } else {
        validationAttempts++;

        if (validationAttempts >= MAX_ATTEMPTS) {
          clearInterval(countdownInterval);

          document.getElementById("validationMessage").textContent =
            "Invalid code and maximum attempts to validate have been reached";
          document.getElementById("validationMessage").style.color = "red";

          document.getElementById("validateCodeBtn").style.display = "none";
          document.getElementById("emailCode").disabled = true;
          document.getElementById("resendCodeBtn").style.display = "none";
          document.getElementById("timerText").style.display = "none";

          return;
        }

        clearInterval(countdownInterval);

        document.getElementById("validationMessage").textContent =
          "Invalid verification code";
        document.getElementById("validationMessage").style.color = "red";

        document.getElementById("validateCodeBtn").style.display = "none";
        document.getElementById("resendCodeBtn").classList.remove("hidden");
        document.getElementById("timerText").style.display = "none";
      }
    } catch (err) {
      alert(err.message);
    }
  });

// Resend code
document
  .getElementById("resendCodeBtn")
  .addEventListener("click", async () => {
    const email = document.getElementById("signupEmail").value;

    try {
      const res = await fetch("/api/email/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("New verification code sent");

        document.getElementById("validationMessage").textContent = "";
        document.getElementById("emailCode").value = "";

        document.getElementById("validateCodeBtn").style.display = "block";
        document.getElementById("resendCodeBtn").classList.add("hidden");

        document.getElementById("timerText").style.display = "block";
        document.getElementById("timerText").innerHTML =
          'Code expires in <span id="timer">60</span>s';

        startTimer();
      }
    } catch (err) {
      alert(err.message);
    }
  });

  // Finish registration
document.getElementById('signupStep2').addEventListener('submit', async (e)=>{
  e.preventDefault();

  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const password2 = document.getElementById('signupPassword2').value;

  if(password !== password2) {
    alert('Passwords do not match!');
    return;
  }

  const role = document.getElementById('signupRole').value;
  const first_name = document.getElementById('signupFirstName').value;
  const last_name = document.getElementById('signupLastName').value;
  const passport = document.getElementById('signupPassport').value;
  const address = document.getElementById('signupAddress').value;
  const telephone = document.getElementById('signupTelephone').value;

  try {
    const res = await fetch('/api/auth/register', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        email,
        role,
        first_name,
        last_name,
        passport,
        address,
        telephone,
        password
      })
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      alert('Unexpected server response');
      return;
    }

    if(res.ok){
      alert('Registration successful! Please login.');
      window.location.href = '/';
    } else {
      alert(data.message || 'Registration failed');
    }

  } catch(err){
    alert('Registration request failed: ' + err.message);
  }
});