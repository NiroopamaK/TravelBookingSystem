function loadSignUp() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');

  // Reset Sign Up forms to Step 1
  document.getElementById('signupStep1').classList.remove('hidden');
  document.getElementById('signupStep2').classList.add('hidden');
}

function loadLogin() {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

// Show Step 2 after clicking "Create Account"
function signupStep2() {
  document.getElementById('signupStep1').classList.add('hidden');
  document.getElementById('signupStep2').classList.remove('hidden');
}
