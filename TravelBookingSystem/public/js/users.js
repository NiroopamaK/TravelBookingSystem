let users = [];
let page = 1;
const limit = 5;

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
});

async function loadUsers(){

    const res = await fetch("/api/admin/users");
    users = await res.json();

    renderTable();
}

function renderTable(){

    const role = document.getElementById("roleFilter").value;

    let filtered = users;

    if(role !== "ALL"){
        filtered = users.filter(u => u.role === role);
    }

    const start = (page-1)*limit;
    const end = start+limit;

    const paginated = filtered.slice(start,end);

    const table = document.getElementById("usersTable");

    table.innerHTML="";

    paginated.forEach((u,i)=>{

        const row = document.createElement("tr");

        row.innerHTML=`
            <td>${u.first_name} ${u.last_name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td><button onclick="toggleDetails(${i})">View</button></td>
        `;

        const details = document.createElement("tr");

        details.id="details-"+i;
        details.style.display="none";

        details.innerHTML=`
        <td colspan="4">
            Address: ${u.address}<br>
            Telephone: ${u.telephone}<br>
            Passport: ${u.passport}
        </td>
        `;

        table.appendChild(row);
        table.appendChild(details);

    });

    document.getElementById("pageNumber").textContent = page;

}

function toggleDetails(i){

    const row = document.getElementById("details-"+i);

    row.style.display =
        row.style.display === "table-row" ? "none" : "table-row";
}

document.getElementById("roleFilter").addEventListener("change",()=>{
    page = 1;
    renderTable();
});

document.getElementById("next").onclick=()=>{
    page++;
    renderTable();
};

document.getElementById("prev").onclick=()=>{
    if(page>1) page--;
    renderTable();
};

loadUsers();