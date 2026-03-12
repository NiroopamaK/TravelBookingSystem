async function loadAgentProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const res = await fetch('/api/agent/profile', {
        headers: { Authorization: 'Bearer ' + token }
    });

    if (!res.ok) {
        console.error('Failed to load profile');
        return;
    }

    const agent = await res.json();

    document.getElementById('agentId').textContent = agent.user_id;
    document.getElementById('firstName').textContent = agent.first_name;
    document.getElementById('lastName').textContent = agent.last_name;
    document.getElementById('email').textContent = agent.email;
    document.getElementById('passport').textContent = agent.passport || '';
    document.getElementById('address').textContent = agent.address || '';
    document.getElementById('telephone').textContent = agent.telephone || '';
}

loadAgentProfile();
