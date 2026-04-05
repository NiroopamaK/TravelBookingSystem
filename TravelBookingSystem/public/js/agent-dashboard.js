// ================= STATS =================
async function loadStats() {
    try {
        const res = await fetch('/api/agent/dashboard-stats', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        document.getElementById('totalPackages').textContent    = data.totalPackages;
        document.getElementById('totalBookings').textContent     = data.totalTrips;
        document.getElementById('confirmedBookings').textContent = data.confirmedBookings;
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// ================= SUMMARY =================
let cachedMostUsedPackage = null;

async function loadSummary() {
    try {
        const res = await fetch('/api/agent/dashboard-summary', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch summary');
        const data = await res.json();

        // Most Used Package
        const pkg = data.mostUsedPackage;
        cachedMostUsedPackage = pkg;
        if (pkg) {
            document.getElementById('mostUsedPackageName').textContent = pkg.title;
            document.getElementById('mostUsedPackageSub').textContent  =
                pkg.destination + '  •  ' + pkg.completed_count + ' completed booking' + (pkg.completed_count !== 1 ? 's' : '');
            document.getElementById('mostUsedPackageCard').classList.add('summary-card--active');
        } else {
            document.getElementById('mostUsedPackageName').textContent = 'No completed bookings yet';
            document.getElementById('mostUsedPackageSub').textContent  = '';
            document.getElementById('mostUsedPackageCard').classList.remove('summary-card--active');
        }

        // Total Revenue
        const rev = Number(data.totalRevenue);
        document.getElementById('totalRevenue').textContent =
            '£' + rev.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Top Traveller
        const trav = data.topTraveller;
        if (trav) {
            document.getElementById('topTravellerName').textContent = trav.traveller_name;
            document.getElementById('topTravellerSub').textContent  =
                trav.trip_count + ' completed booking' + (trav.trip_count !== 1 ? 's' : '');
        } else {
            document.getElementById('topTravellerName').textContent = 'No completed bookings yet';
            document.getElementById('topTravellerSub').textContent  = '';
        }
    } catch (err) {
        console.error('Error loading summary:', err);
    }
}

// ================= PACKAGE DETAIL MODAL =================
const pkgDetailModal       = document.getElementById('pkgDetailModal');
const closePkgDetailModalBtn = document.getElementById('closePkgDetailModalBtn');

function openMostUsedPackageModal() {
    const pkg = cachedMostUsedPackage;
    if (!pkg) return;

    const fmt = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    document.getElementById('pkgDetailTitle').textContent      = pkg.title;
    document.getElementById('pkgDetailDestination').textContent = pkg.destination;
    document.getElementById('pkgDetailStartDate').textContent  = fmt(pkg.start_date);
    document.getElementById('pkgDetailEndDate').textContent    = fmt(pkg.end_date);
    document.getElementById('pkgDetailPrice').textContent      =
        pkg.price != null ? '£' + Number(pkg.price).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
    document.getElementById('pkgDetailCreatedOn').textContent  = fmt(pkg.created_on);
    document.getElementById('pkgDetailDescription').textContent = pkg.description || '-';

    const itineraryEl = document.getElementById('pkgDetailItinerary');
    itineraryEl.innerHTML = '';
    if (pkg.itinerary_items && pkg.itinerary_items.length > 0) {
        pkg.itinerary_items.forEach((item, i) => {
            const li = document.createElement('li');
            li.className = 'view-pkg-itinerary-item';
            li.innerHTML = `
                <span class="itinerary-step">${i + 1}</span>
                <div>
                    <strong>${item.title}</strong>
                    <p>${item.description}</p>
                </div>
            `;
            itineraryEl.appendChild(li);
        });
    } else {
        itineraryEl.innerHTML = '<li class="no-itinerary">No itinerary items.</li>';
    }

    pkgDetailModal.classList.add('active');
}

function closePkgDetailModal() { pkgDetailModal.classList.remove('active'); }

closePkgDetailModalBtn.addEventListener('click', closePkgDetailModal);
pkgDetailModal.addEventListener('click', (e) => { if (e.target === pkgDetailModal) closePkgDetailModal(); });

document.getElementById('mostUsedPackageCard').addEventListener('click', openMostUsedPackageModal);

// ================= INIT =================
loadStats();
loadSummary();
