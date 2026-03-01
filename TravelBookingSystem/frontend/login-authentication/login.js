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

const signupFormStep2 = document.getElementById('signupStep2');

signupFormStep2.addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('signupPassword').value;
  const password2 = document.getElementById('signupPassword2').value;

  // Frontend validation
  if (password !== password2) {
    alert('Passwords do not match!');
    return; // Stop form submission
  }

  // Collect all signup data
  const role = document.getElementById('signupRole').value;
  const first_name = document.getElementById('signupFirstName').value;
  const last_name = document.getElementById('signupLastName').value;
  const passport = document.getElementById('signupPassport').value;
  const address = document.getElementById('signupAddress').value;
  const telephone = document.getElementById('signupTelephone').value;
  const email = document.getElementById('signupEmail').value;

  // Send data to backend
  try {
    console.log('Signup payload:', { email, role, first_name, last_name, passport, address, telephone, password });
    const res = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, role, first_name, last_name, passport, address, telephone, password })
});

    /*const data = await res.json();
    if (res.ok) {
      alert('Registration successful! Please login.');
      loadLogin(); // Go back to login form
    } else {
      alert(data.message);
    }*/

      const text = await res.text();   // <-- get raw response
console.log('Raw response from backend:', text);

try {
  const data = JSON.parse(text); // try to parse JSON
  console.log('Parsed JSON:', data);
  if (res.ok) {
    localStorage.setItem('token', data.token);
    alert('Login successful!');
    window.location.href = '/frontend/dashboard.html';
  } else {
    alert(data.message);
  }
} catch (err) {
  console.error('Failed to parse JSON:', err);
}
  } catch (err) {
    console.error(err);
    alert('Registration failed');
  }
});

// Get login form element
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text(); // get raw response
    console.log('Raw response:', text);

    try {
      const data = JSON.parse(text);
      console.log('Parsed JSON:', data);

      if (res.ok) {
        // Store JWT token in localStorage
        console.log("success")
        localStorage.setItem('token', data.token);
        alert('Login successful!');
        window.location.href = '/frontend/dashboard.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      alert('Unexpected server response');
    }
  } catch (err) {
    console.error(err);
    alert('Login request failed');
  }
});