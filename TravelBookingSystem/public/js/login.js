document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { alert('Unexpected server response'); return; }

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    alert('Login request failed: ' + err.message);
  }
});