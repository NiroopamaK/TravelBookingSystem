let packages = [];
let page = 1;
const limit = 5;

document.addEventListener("DOMContentLoaded", () => {

    loadPackages();

    document.getElementById("applyFilter").addEventListener("click", () => {
        page = 1;
        renderTable();
    });

    document.getElementById("next").onclick = () => {
        page++;
        renderTable();
    };

    document.getElementById("prev").onclick = () => {
        if(page > 1) page--;
        renderTable();
    };

});


async function loadPackages(){

    const res = await fetch("/api/admin/packages");
    packages = await res.json();
    renderTable();

}


function renderTable(){

    const table = document.getElementById("packagesTable");
    if(!table) return;

    const dest = document.getElementById("destFilter").value.toLowerCase();
    const agent = document.getElementById("agentFilter").value.toLowerCase();
    const min = parseFloat(document.getElementById("minPrice").value);
    const max = parseFloat(document.getElementById("maxPrice").value);

    let filtered = packages.filter(p => {

        const creator = `${p.agent_first_name} ${p.agent_last_name}`.toLowerCase();
        const price = parseFloat(p.price);

        return (
            (!dest || p.destination.toLowerCase().includes(dest)) &&
            (!agent || creator.includes(agent)) &&
            (isNaN(min) || price >= min) &&
            (isNaN(max) || price <= max)
        );

    });


    const start = (page-1)*limit;
    const end = start + limit;
    const paginated = filtered.slice(start,end);

    table.innerHTML = "";

    paginated.forEach((p) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${p.title}</td>
            <td>${p.destination}</td>
            <td>${p.agent_first_name} ${p.agent_last_name}</td>
            <td>$${p.price}</td>
            <td><button onclick="toggleDetails(${p.package_id})">View</button></td>
        `;

        const details = document.createElement("tr");

        details.id = "details-"+p.package_id;
        details.style.display = "none";

        details.innerHTML = `
            <td colspan="5">
                <strong>Description:</strong> ${p.description}
            </td>
        `;

        table.appendChild(row);
        table.appendChild(details);

    });

    document.getElementById("pageNumber").textContent = page;

    const nextBtn = document.getElementById("next");
    nextBtn.disabled = end >= filtered.length;

}


// TOGGLE PACKAGE DETAILS
function toggleDetails(id){

    const row = document.getElementById("details-"+id);

    if(!row) return;

    if(row.style.display === "none"){
        row.style.display = "table-row";
    }else{
        row.style.display = "none";
    }

}