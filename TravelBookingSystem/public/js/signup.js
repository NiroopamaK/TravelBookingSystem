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

  document.getElementById("afterCodeSent").classList.add("hidden");
  document.getElementById("passwordSection").classList.add("hidden");

  document.getElementById("sendCodeBtn").style.display = "block";
  validationAttempts = 0;
  resendAttempts = 0;
  codeValidated = false;

  clearInterval(countdownInterval);
}

new EmailVerification({
  emailInput: "signupEmail",
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

