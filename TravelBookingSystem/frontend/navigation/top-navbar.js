function initNavbar() {
  console.log('Navbar JS running now');

  const profilePic = document.getElementById('profilePic');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const signOutBtn = document.getElementById('signOutBtn');

  if (!profilePic || !dropdownMenu || !signOutBtn) {
    console.error('Navbar elements not found!');
    return;
  }

  console.log('Checking localStorage token...');

  // Toggle dropdown
  profilePic.addEventListener('click', () => {
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!profilePic.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.style.display = 'none';
    }
  });

  // Sign out
  signOutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  });

  // Load user info dynamically
  const token = localStorage.getItem('token');
  console.log('Token:', token);
  if (token) {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))
      );
      console.log('Decoded payload:', payload);
      document.querySelector('.profile-name').textContent = payload.first_name || 'John Doe';
      document.querySelector('.profile-role').textContent = `(${payload.role})`;
    } catch (err) {
      console.error('Failed to parse JWT:', err);
    }
  }
}

initNavbar();