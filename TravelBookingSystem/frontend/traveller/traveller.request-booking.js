let currentPackage = null;
let PRICE = 2500;

function loadPackageData() {
    const urlParams = new URLSearchParams(window.location.search);
    const packageId = urlParams.get('packageId');
    
    if (packageId) {
        fetch(`/api/packages/${packageId}`)
            .then(response => response.json())
            .then(package => {
                currentPackage = package;
                PRICE = package.price;
                updatePackageDisplay();
            })
            .catch(error => {
                console.error('Error loading package:', error);
                loadFallbackPackage();
            });
    } else {
        loadFallbackPackage();
    }
}

function loadFallbackPackage() {
    const savedPackage = localStorage.getItem('selectedPackage');
    if (savedPackage) {
        currentPackage = JSON.parse(savedPackage);
        PRICE = currentPackage.price || 2500;
        updatePackageDisplay();
    }
}

function updatePackageDisplay() {
    if (currentPackage) {
        document.getElementById('packageDates').textContent = currentPackage.dates || 'June 15 - June 25, 2026';
        document.getElementById('pricePerPerson').textContent = formatMoney(PRICE);
    }
    updateTotals();
}

const peopleInput = document.getElementById("people");
const peopleOut = document.getElementById("peopleOut");
const totalOut = document.getElementById("totalOut");
const successBox = document.getElementById("successBox");

function formatMoney(num) {
    return "£ " + num.toLocaleString("en-GB");
}

function updateTotals() {
    let people = peopleInput.value;
    if (people < 1 || people === "") {
        people = 1;
    }
    people = Number(people);
    peopleInput.value = people;
    peopleOut.textContent = people;
    const total = people * PRICE;
    totalOut.textContent = formatMoney(total);
}

function getToken() {
    return localStorage.getItem('token');
}

function getUserId() {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

peopleInput.oninput = updateTotals;

document.getElementById("bookingForm").onsubmit = function(e) {
    e.preventDefault();
    
    const token = getToken();
    const userId = getUserId();
    
    if (!token || !userId) {
        alert('Please log in to make a booking');
        return;
    }
    
    const bookingData = {
        userId: userId,
        packageId: currentPackage ? currentPackage.id : null,
        numberOfPeople: Number(peopleInput.value),
        notes: document.getElementById('notes').value,
        totalPrice: Number(peopleInput.value) * PRICE,
        status: 'PENDING'
    };
    
    fetch('/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to submit booking');
        }
        return response.json();
    })
    .then(data => {
        console.log('Booking submitted:', data);
        successBox.style.display = "block";
        successBox.scrollIntoView({ behavior: "smooth", block: "start" });
        
        document.getElementById('notes').value = '';
        peopleInput.value = 2;
        updateTotals();
    })
    .catch(error => {
        console.error('Error submitting booking:', error);
        alert('Failed to submit booking. Please try again.');
    });
};
document.addEventListener('DOMContentLoaded', function() {
    loadPackageData();
    updateTotals();
});
