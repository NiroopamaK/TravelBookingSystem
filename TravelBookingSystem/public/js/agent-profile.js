async function loadAgentProfile() {
    try {
        const res = await fetch('/api/agent/profile', { credentials: 'include' });

        if (!res.ok) {
            console.error('Failed to load profile');
            // Redirect to login if session is invalid
            if (res.status === 401 || res.status === 403) {
                window.location.href = '/';
            }
            return;
        }

        const agent = await res.json();

        document.getElementById('agentId').textContent      = agent.user_id;
        document.getElementById('firstName').textContent   = agent.first_name;
        document.getElementById('lastName').textContent    = agent.last_name;
        document.getElementById('email').textContent       = agent.email;
        document.getElementById('passport').textContent    = agent.passport || '';
        document.getElementById('address').textContent     = agent.address || '';
        document.getElementById('telephone').textContent   = agent.telephone || '';
    } catch (err) {
        console.error('Error loading profile:', err);
        alert('Could not load agent profile. Please try again.');
    }
}

loadAgentProfile();