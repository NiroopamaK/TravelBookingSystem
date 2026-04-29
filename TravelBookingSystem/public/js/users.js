let users = [];
let page = 1;
const limit = 5;

document.addEventListener("DOMContentLoaded", () => {

    loadUsers();

    // FILTER CHANGE
    document.getElementById("roleFilter").addEventListener("change",()=>{
        page = 1;
        renderTable();
    });

    // PAGINATION
    document.getElementById("next").onclick=()=>{
        page++;
        renderTable();
    };

    document.getElementById("prev").onclick=()=>{
        if(page>1) page--;
        renderTable();
    };

    // CLOSE MODAL
    document.getElementById("closeUserModalBtn").onclick = () => {
        document.getElementById("viewUserModal").classList.remove("active");
    };

    // CLICK OUTSIDE CLOSE
    document.getElementById("viewUserModal").onclick = (e) => {
        if(e.target.id === "viewUserModal"){
            e.currentTarget.classList.remove("active");
        }
    };

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

    paginated.forEach((u)=>{

        const row = document.createElement("tr");

        row.innerHTML=`
            <td>${u.first_name} ${u.last_name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td><button class="btn-view" onclick="openUserModal(${u.user_id})">View</button></td>
        `;

        table.appendChild(row);

    });

    document.getElementById("pageNumber").textContent = page;
}


// ✅ OPEN MODAL
function openUserModal(id){

    const user = users.find(u => u.user_id === id);
    if(!user) return;

    document.getElementById("viewUserName").textContent =
        `${user.first_name} ${user.last_name}`;

    document.getElementById("viewUserRole").textContent = user.role;
    document.getElementById("viewUserEmail").textContent = user.email;
    document.getElementById("viewUserAddress").textContent = user.address;
    document.getElementById("viewUserTelephone").textContent = user.telephone;
    document.getElementById("viewUserPassport").textContent = user.passport;

    document.getElementById("viewUserModal").classList.add("active");
}