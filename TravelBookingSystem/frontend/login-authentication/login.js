// -------------------------
// FORM TOGGLE FUNCTIONS
// -------------------------
function loadSignUp() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');

  document.getElementById('signupStep1').classList.remove('hidden');
  document.getElementById('signupStep2').classList.add('hidden');
}

function loadLogin() {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}

function signupStep2() {
  document.getElementById('signupStep1').classList.add('hidden');
  document.getElementById('signupStep2').classList.remove('hidden');
}

// -------------------------
// SIGNUP STEP 2 SUBMIT
// -------------------------
const signupFormStep2 = document.getElementById('signupStep2');

signupFormStep2.addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('signupPassword').value;
  const password2 = document.getElementById('signupPassword2').value;

  if (password !== password2) {
    alert('Passwords do not match!');
    return;
  }

  const role = document.getElementById('signupRole').value;
  const first_name = document.getElementById('signupFirstName').value;
  const last_name = document.getElementById('signupLastName').value;
  const passport = document.getElementById('signupPassport').value;
  const address = document.getElementById('signupAddress').value;
  const telephone = document.getElementById('signupTelephone').value;
  const email = document.getElementById('signupEmail').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, first_name, last_name, passport, address, telephone, password })
    });

    const text = await res.text();
    console.log('Raw response from backend:', text);

    try {
      const data = JSON.parse(text);
      console.log('Parsed JSON:', data);

      if (res.ok) {
        alert('Registration successful! Please login.');
        loadLogin(); // Go back to login form
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      alert('Unexpected server response');
    }

  } catch (err) {
    console.error(err);
    alert('Registration request failed');
  }
});

// -------------------------
// LOGIN FORM
// -------------------------
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

    const text = await res.text();
    console.log('Raw response:', text);

    try {
      const data = JSON.parse(text);
      console.log('Parsed JSON:', data);

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);

        const decodedPayload = parseJwt(data.token);
        if (!decodedPayload) {
          alert('Failed to decode token');
          return;
        }

        const role = decodedPayload.role;
        console.log('Role from JWT:', role);
        window.location.href = '../dashboard/dashboard.html';

        /* Role-based redirection
        switch (role) {
          case 'ADMIN':
            window.location.href = '../admin/admin.html';
            break;
          case 'TRAVELLER':
            //window.location.href = '../traveller/traveller.dashboard.html';
            window.location.href = '../admin/admin.html';
            break;
          case 'TRAVEL_AGENT':
            window.location.href = '../admin/admin.html';
            break;
          default:
            alert('Unknown role. Redirecting to dashboard.');
            window.location.href = '../admin/admin.html';
        }*/
      } else {
        alert(data.message || 'Login failed or no token returned');
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

// -------------------------
// JWT DECODING HELPER
// -------------------------
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const jsonPayload = atob(padded);
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('JWT parsing error:', err);
    return null;
  }
}