let countdownInterval;
let timeLeft = 60;
let validationAttempts = 1;
let resendAttempts = 0;
let codeValidated = false;
const MAX_ATTEMPTS = 3;


//STEP 1 -> STEP 2 NAVIGATION
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


// EMAIL VERIFICATION INIT
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


// FINISH REGISTRATION
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
  const countryCode = document.getElementById('countryCode').value;
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
        telephone: countryCode + telephone,
        password
      })
    });

    const text = await res.text();
    let data;

    try { data = JSON.parse(text); } 
    catch { alert('Unexpected server response'); return; }

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

// STEP 1 VALIDATION + RULES
const step1Fields = [
  "signupRole",
  "signupFirstName",
  "signupLastName",
  "signupPassport",
  "signupAddress",
  "signupTelephone",
  "countryCode"
];

const nextBtn = document.getElementById("nextStepBtn");

function validateStep1(){
  const role = document.getElementById("signupRole").value;
  const first = document.getElementById("signupFirstName").value.trim();
  const last = document.getElementById("signupLastName").value.trim();
  const passport = document.getElementById("signupPassport").value.trim();
  const address = document.getElementById("signupAddress").value.trim();
  const phone = document.getElementById("signupTelephone").value.trim();
  const code = document.getElementById("countryCode").value;

  const phoneRegex = /^[0-9]{7,12}$/;

  const valid =
    role &&
    first.length >= 1 &&
    last.length >= 1 &&
    passport.length >= 8 &&
    address.length >= 1 &&
    phoneRegex.test(phone) &&
    code;

  nextBtn.disabled = !valid;
}

// Show/hide rules dynamically for Step 1 fields
step1Fields.forEach(id => {
  const field = document.getElementById(id);
  const rulesEl = document.getElementById(id + "Rules");

  const checkField = () => {
    if (!rulesEl) return;

    let valid = false;
    const val = field.value.trim();

    switch(id){
      case "signupFirstName": valid = val.length >= 1; break;
      case "signupLastName": valid = val.length >= 1; break;
      case "signupPassport": valid = val.length >= 8; break;
      case "signupAddress": valid = val.length >= 1; break;
      case "signupTelephone": valid = /^[0-9]{7,12}$/.test(val); break;
      case "countryCode": valid = val !== ""; break;
      case "signupRole": valid = val !== ""; break;
    }

    if(valid){
      rulesEl.classList.add("hidden");
    } else {
      rulesEl.classList.remove("hidden");
    }
  };

  field.addEventListener("input", () => { checkField(); validateStep1(); });
  field.addEventListener("focus", checkField);
  field.addEventListener("blur", checkField);
  field.addEventListener("change", validateStep1);
});


// STEP 2 EMAIL VALIDATION + RULE
const emailInput = document.getElementById("signupEmail");
const emailRules = document.getElementById("emailRules");

function validateEmail() {
  if(emailInput.checkValidity()){
    emailRules.classList.add("hidden");
  } else {
    emailRules.classList.remove("hidden");
    emailRules.children[0].textContent = "❌ Must be a valid email";
  }
}

emailInput.addEventListener("focus", validateEmail);
emailInput.addEventListener("input", validateEmail);
emailInput.addEventListener("blur", validateEmail);


// STEP 2 PASSWORD VALIDATION (login.js style)
document.addEventListener("DOMContentLoaded", function () {

  const password = document.getElementById("signupPassword");
  const confirmPassword = document.getElementById("signupPassword2");
  const finishBtn = document.getElementById("finishBtn");

  const ruleLength = document.getElementById("ruleLength");
  const ruleUpper = document.getElementById("ruleUpper");
  const ruleLower = document.getElementById("ruleLower");
  const ruleNumber = document.getElementById("ruleNumber");
  const ruleSpecial = document.getElementById("ruleSpecial");

  if (!password || !confirmPassword || !finishBtn) return;

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

    const strongPassword =
      lengthValid &&
      upperValid &&
      lowerValid &&
      numberValid &&
      specialValid;

    // Confirm password
    const confirmValid = pass === confirm && confirm !== "";

    if(confirm === "") {
    document.getElementById("password2Rules").classList.add("hidden");
  } else if(confirmValid){
    document.getElementById("password2Rules").classList.add("hidden");
  } else {
    document.getElementById("password2Rules").classList.remove("hidden");
  }

    finishBtn.disabled = !(strongPassword && confirmValid);
  }

  function toggleRule(element, valid) {
    if (valid) {
      element.classList.add("valid");
    } else {
      element.classList.remove("valid");
    }
  }

  password.addEventListener("input", validatePassword);
  confirmPassword.addEventListener("input", validatePassword);

});

//clear form when reloading
// Clear signup form and reset buttons on page load
window.addEventListener("load", () => {
  const step1Form = document.getElementById("signupStep1");
  const step2Form = document.getElementById("signupStep2");
  const nextBtn = document.getElementById("nextStepBtn");
  const finishBtn = document.getElementById("finishBtn");

  if(step1Form) step1Form.reset();
  if(step2Form) step2Form.reset();

  if(nextBtn) nextBtn.disabled = true;
  if(finishBtn) finishBtn.disabled = true;

  // Hide rules
  document.querySelectorAll(".rules").forEach(el => el.classList.add("hidden"));
});