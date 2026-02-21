var PRICE = 2500;

var peopleInput = document.getElementById("people");
var peopleOut = document.getElementById("peopleOut");
var totalOut = document.getElementById("totalOut");
var successBox = document.getElementById("successBox");

function formatMoney(num) {
    return "£ " + num.toLocaleString("en-GB");
}

function updateTotals() {
    var people = peopleInput.value;
    if (people < 1 || people == "") {
        people = 1;
    }
    people = Number(people);
    peopleInput.value = people;
    peopleOut.textContent = people;
    var total = people * PRICE;
    totalOut.textContent = formatMoney(total);
}

peopleInput.oninput = updateTotals;
updateTotals();

document.getElementById("bookingForm").onsubmit = function(e) {
    e.preventDefault();
    successBox.style.display = "block";
    successBox.scrollIntoView({ behavior: "smooth", block: "start" });
};