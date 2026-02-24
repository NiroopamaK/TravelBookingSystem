// ── Sample package data (replace with API call) ──────────────────────────────
var packages = [
    { id: 1, name: 'Amazing Adventure Tour', destination: 'Vietnam',     duration: 10, price: 1200, description: 'A thrilling adventure through the heart of Vietnam.',  status: 'Active'   },
    { id: 2, name: 'Beach Getaway',          destination: 'Hawaii',      duration: 7,  price: 1800, description: 'Relax on the beautiful beaches of Hawaii.',            status: 'Active'   },
    { id: 3, name: 'Mountain Explorer',      destination: 'Switzerland', duration: 8,  price: 2200, description: 'Explore the stunning Swiss Alps and mountain villages.', status: 'Inactive' },
    { id: 4, name: 'Cultural Heritage Tour', destination: 'Japan',       duration: 12, price: 2500, description: 'Discover centuries of culture and tradition in Japan.', status: 'Active'   },
];

// ── Render table ──────────────────────────────────────────────────────────────
function renderTable() {
    var tbody = document.getElementById('packagesTbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    packages.forEach(function(pkg, index) {
        var pillClass = pkg.status === 'Active' ? 'pill-active' : 'pill-inactive';
        var row = document.createElement('tr');
        row.innerHTML =
            '<td>' + (index + 1) + '</td>' +
            '<td>' + escHtml(pkg.name) + '</td>' +
            '<td>' + escHtml(pkg.destination) + '</td>' +
            '<td>' + pkg.duration + ' days</td>' +
            '<td>$' + Number(pkg.price).toLocaleString() + '</td>' +
            '<td><span class="pill ' + pillClass + '">' + escHtml(pkg.status) + '</span></td>' +
            '<td class="table-right">' +
                '<button class="btn btn-edit" type="button" data-id="' + pkg.id + '" onclick="openEdit(' + pkg.id + ')">Edit</button>' +
                '<button class="btn btn-delete" style="margin-left:8px;" type="button" data-id="' + pkg.id + '" onclick="openDelete(' + pkg.id + ')">Delete</button>' +
            '</td>';
        tbody.appendChild(row);
    });
}

// ── Helper: escape HTML to prevent XSS ───────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Find package by id ────────────────────────────────────────────────────────
function findPkg(id) {
    for (var i = 0; i < packages.length; i++) {
        if (packages[i].id === id) return packages[i];
    }
    return null;
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function openEdit(id) {
    var pkg = findPkg(id);
    if (!pkg) return;

    document.getElementById('editId').value          = pkg.id;
    document.getElementById('editName').value        = pkg.name;
    document.getElementById('editDestination').value = pkg.destination;
    document.getElementById('editDuration').value    = pkg.duration;
    document.getElementById('editPrice').value       = pkg.price;
    document.getElementById('editDescription').value = pkg.description;
    document.getElementById('editStatus').value      = pkg.status;

    document.getElementById('editOverlay').classList.add('open');
}

function closeEdit() {
    document.getElementById('editOverlay').classList.remove('open');
}

document.getElementById('editClose').onclick  = closeEdit;
document.getElementById('editCancel').onclick = closeEdit;

document.getElementById('editForm').onsubmit = function(e) {
    e.preventDefault();

    var id  = Number(document.getElementById('editId').value);
    var pkg = findPkg(id);
    if (!pkg) return;

    pkg.name        = document.getElementById('editName').value.trim();
    pkg.destination = document.getElementById('editDestination').value.trim();
    pkg.duration    = Number(document.getElementById('editDuration').value);
    pkg.price       = Number(document.getElementById('editPrice').value);
    pkg.description = document.getElementById('editDescription').value.trim();
    pkg.status      = document.getElementById('editStatus').value;

    renderTable();
    closeEdit();
};

// ── Delete modal ──────────────────────────────────────────────────────────────
var pendingDeleteId = null;

function openDelete(id) {
    var pkg = findPkg(id);
    if (!pkg) return;

    pendingDeleteId = id;
    document.getElementById('deleteName').textContent = pkg.name;
    document.getElementById('deleteOverlay').classList.add('open');
}

function closeDelete() {
    pendingDeleteId = null;
    document.getElementById('deleteOverlay').classList.remove('open');
}

document.getElementById('deleteClose').onclick  = closeDelete;
document.getElementById('deleteCancel').onclick = closeDelete;

document.getElementById('deleteConfirm').onclick = function() {
    if (pendingDeleteId === null) return;

    packages = packages.filter(function(p) { return p.id !== pendingDeleteId; });
    renderTable();
    closeDelete();
};

// ── Close modals on overlay click ────────────────────────────────────────────
document.getElementById('editOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeEdit();
});
document.getElementById('deleteOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeDelete();
});

// ── Close modals on Escape ────────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEdit();
        closeDelete();
    }
});

// ── Init ──────────────────────────────────────────────────────────────────────
renderTable();
