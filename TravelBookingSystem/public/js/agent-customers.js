const API_CUSTOMERS = '/api/agent/customers';

const customersBody = document.getElementById('customersBody');

async function loadCustomers() {
    const res = await fetch(API_CUSTOMERS);
    const customers = await res.json();
    customersBody.innerHTML = '';
    customers.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.user_id}</td>
            <td>${c.first_name}</td>
            <td>${c.last_name}</td>
            <td>${c.email}</td>
            <td>${c.passport || ''}</td>
            <td>${c.address || ''}</td>
            <td>${c.telephone || ''}</td>
        `;
        customersBody.appendChild(tr);
    });
}

loadCustomers();
