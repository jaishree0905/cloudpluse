// ================================
// CloudPulse Dashboard Script
// ================================

// Chart Arrays
const labels = [];
const cpuData = [];
const memoryData = [];
const diskData = [];

// Chart
const ctx = document.getElementById("metricChart").getContext("2d");

const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: labels,
        datasets: [
            {
                label: "CPU",
                data: cpuData,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.2)",
                borderWidth: 3,
                tension: 0.4,
                fill: false
            },
            {
                label: "Memory",
                data: memoryData,
                borderColor: "#22c55e",
                backgroundColor: "rgba(34,197,94,0.2)",
                borderWidth: 3,
                tension: 0.4,
                fill: false
            },
            {
                label: "Disk",
                data: diskData,
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245,158,11,0.2)",
                borderWidth: 3,
                tension: 0.4,
                fill: false
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: "white"
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: "white"
                },
                grid: {
                    color: "#334155"
                }
            },
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    color: "white"
                },
                grid: {
                    color: "#334155"
                }
            }
        }
    }
});

// ================================
// Load Live Metrics
// ================================

async function loadData() {

    try {

        const response = await fetch("http://127.0.0.1:5000/metrics");

        const data = await response.json();

        document.getElementById("cpu").innerHTML = data.cpu + "%";
        document.getElementById("memory").innerHTML = data.memory + "%";
        document.getElementById("disk").innerHTML = data.disk + "%";

        document.getElementById("cpuBar").style.width = data.cpu + "%";
        document.getElementById("memoryBar").style.width = data.memory + "%";
        document.getElementById("diskBar").style.width = data.disk + "%";

        document.getElementById("time").innerHTML =
            new Date().toLocaleTimeString();

        // Health

        if (data.cpu > 80) {

            document.getElementById("healthText").innerHTML = "Warning";
            document.getElementById("healthStatus").innerHTML = "High CPU Usage";

        }

        else if (data.memory > 80) {

            document.getElementById("healthText").innerHTML = "Warning";
            document.getElementById("healthStatus").innerHTML = "High Memory Usage";

        }

        else if (data.disk > 90) {

            document.getElementById("healthText").innerHTML = "Critical";
            document.getElementById("healthStatus").innerHTML = "Disk Almost Full";

        }

        else {

            document.getElementById("healthText").innerHTML = "Healthy";
            document.getElementById("healthStatus").innerHTML =
                "Everything is running smoothly";

        }

        labels.push(new Date().toLocaleTimeString());

        cpuData.push(data.cpu);
        memoryData.push(data.memory);
        diskData.push(data.disk);

        if (labels.length > 20) {

            labels.shift();
            cpuData.shift();
            memoryData.shift();
            diskData.shift();

        }

        chart.update();

    }

    catch (err) {

        console.log(err);

    }

}

// ================================
// History Table
// ================================

async function loadHistory() {

    const response = await fetch("http://127.0.0.1:5000/history");

    const data = await response.json();

    const table = document.getElementById("historyTable");

    table.innerHTML = "";

    data.slice().reverse().forEach((item, index) => {

        table.innerHTML += `
        <tr>

            <td>${index + 1}</td>

            <td>${item.time}</td>

            <td>${item.cpu}%</td>

            <td>${item.memory}%</td>

            <td>${item.disk}%</td>

        </tr>
        `;

    });

}

// ================================
// Statistics
// ================================

async function loadStatistics() {

    const response = await fetch("http://127.0.0.1:5000/history");

    const data = await response.json();

    if (data.length === 0) return;

    const cpu = data.map(x => x.cpu);

    const avg = cpu.reduce((a, b) => a + b, 0) / cpu.length;

    document.getElementById("avgCpu").innerHTML =
        avg.toFixed(1) + "%";

    document.getElementById("maxCpu").innerHTML =
        Math.max(...cpu) + "%";

    document.getElementById("minCpu").innerHTML =
        Math.min(...cpu) + "%";

    document.getElementById("records").innerHTML =
        data.length;

}

// ================================
// Download CSV
// ================================

function downloadCSV() {

    fetch("http://127.0.0.1:5000/history")

        .then(response => response.json())

        .then(data => {

            let csv = "Time,CPU,Memory,Disk\n";

            data.forEach(item => {

                csv +=
                    `${item.time},${item.cpu},${item.memory},${item.disk}\n`;

            });

            const blob = new Blob([csv], { type: "text/csv" });

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = "metrics.csv";

            a.click();

        });

}

// ================================
// Clear History
// ================================

function clearHistory() {

    fetch("http://127.0.0.1:5000/clear", {

        method: "POST"

    })

        .then(response => response.json())

        .then(data => {

            alert(data.message);

            loadHistory();

            loadStatistics();

        });

}

// ================================
// Auto Refresh
// ================================

loadData();

loadHistory();

loadStatistics();

setInterval(loadData, 2000);

setInterval(loadHistory, 5000);

setInterval(loadStatistics, 5000);