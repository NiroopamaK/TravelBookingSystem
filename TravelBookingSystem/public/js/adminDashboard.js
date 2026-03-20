let packageChart;
let bookingChart;


// LOAD DASHBOARD STATS
async function loadStats(){

    try{

        const res = await fetch("/api/admin/stats");
        const stats = await res.json();

        document.getElementById("packages").textContent = stats.packages;
        document.getElementById("bookings").textContent = stats.bookings;
        document.getElementById("agents").textContent = stats.travel_agents;
        document.getElementById("travellers").textContent = stats.travellers;

    }catch(err){

        console.error("Failed to load stats", err);

    }

}


// GET DAYS IN SELECTED MONTH
function getDaysInMonth(month, year){

    return new Date(year, month, 0).getDate();

}


// LOAD CHART DATA
async function loadCharts(month, year){

    try{

        const packageRes = await fetch(`/api/admin/package-summary?month=${month}&year=${year}`);
        const bookingRes = await fetch(`/api/admin/booking-summary?month=${month}&year=${year}`);

        const packageData = await packageRes.json();
        const bookingData = await bookingRes.json();


        const daysInMonth = getDaysInMonth(month, year);
        const days = Array.from({length: daysInMonth}, (_, i) => i + 1);


        const packageCounts = days.map(day => {

            const item = packageData.find(p => p.day === day);
            return item ? item.count : 0;

        });


        const bookingCounts = days.map(day => {

            const item = bookingData.find(b => b.day === day);
            return item ? item.count : 0;

        });


        if(packageChart) packageChart.destroy();
        if(bookingChart) bookingChart.destroy();


        // PACKAGE CHART
        packageChart = new Chart(

            document.getElementById("packageChart"),

            {
                type:"line",
                data:{
                    labels:days,
                    datasets:[{
                        label:"Packages Created",
                        data:packageCounts,
                        borderColor:"#800020",
                        backgroundColor:"rgba(123,79,55,0.15)",
                        pointBackgroundColor:"#800020",
                        borderWidth:3,
                        tension:0.3,
                        fill:true
                    }]
                },
                options:{
                    responsive:true,
                    scales:{
                        y:{beginAtZero:true}
                    }
                }
            }

        );


        // BOOKING CHART
        bookingChart = new Chart(

            document.getElementById("bookingChart"),

            {
                type:"line",
                data:{
                    labels:days,
                    datasets:[{
                        label:"Bookings Created",
                        data:bookingCounts,
                        borderColor:"#814141",
                        backgroundColor:"rgba(123,79,55,0.15)",
                        pointBackgroundColor:"#814141",
                        borderWidth:3,
                        tension:0.3,
                        fill:true
                    }]
                },
                options:{
                    responsive:true,
                    scales:{
                        y:{beginAtZero:true}
                    }
                }
            }

        );


    }catch(err){

        console.error("Failed to load chart data", err);

    }

}


// INITIALIZE MONTH + YEAR SELECTORS
function initDateSelectors(){

    const monthSelect = document.getElementById("monthSelect");
    const yearSelect = document.getElementById("yearSelect");

    const today = new Date();

    monthSelect.value = today.getMonth() + 1;
    yearSelect.value = today.getFullYear();

    loadCharts(monthSelect.value, yearSelect.value);


    monthSelect.addEventListener("change", ()=>{

        loadCharts(monthSelect.value, yearSelect.value);

    });


    yearSelect.addEventListener("change", ()=>{

        loadCharts(monthSelect.value, yearSelect.value);

    });

}


// PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {

    loadStats();
    initDateSelectors();

});