const apiBaseUrl = "https://localhost:7283/api";
const token = localStorage.getItem("token");
let editingWorkoutId = null;
let workoutChart;
let currentChartType = 'bar'; // 'bar' or 'pie'
let currentFilter = "all";
let filteredData = []; // globally store filtered list



// If token is missing, redirect to login immediately
if (!token) {
    alert("You are not logged in. Please login again.");
    window.location.href = "login.html";
}

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
});

document.getElementById("workout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    addWorkout();
});

window.onload = () => {
    loadExerciseTypes();
    loadWorkouts();
    loadWorkoutSummary();

    // Populate filter dropdown
    populateFilterDropdown();

    // Handle filter change
    document.getElementById("filterDropdown").addEventListener("change", e => {
        currentFilter = e.target.value;
        loadWorkouts(); // Reload the filtered workouts and chart
    });
};



async function addWorkout() {
    const exerciseTypeId = parseInt(document.getElementById("exerciseTypeDropdown").value);
    const durationMinutes = parseInt(document.getElementById("duration").value);
    const caloriesBurned = parseInt(document.getElementById("calories").value);
    const heartRate = parseInt(document.getElementById("rate").value);

    if (isNaN(exerciseTypeId) || isNaN(durationMinutes) || isNaN(caloriesBurned) || isNaN(heartRate)) {
        alert("All fields are required and must be valid numbers.");
        return;
    }

    const workoutData = {
        exerciseTypeId,
        durationMinutes,
        caloriesBurned,
        heartRate,
        date: new Date().toISOString()
    };

    const endpoint = editingWorkoutId
        ? `${apiBaseUrl}/Workout/${editingWorkoutId}`
        : `${apiBaseUrl}/Workout`;

    const method = editingWorkoutId ? "PUT" : "POST";

    const res = await fetch(endpoint, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(workoutData)
    });

    if (res.ok) {
        editingWorkoutId = null;
        document.getElementById("action-btn").innerText = "Add Workout";
        resetForm();
        loadWorkouts();
        loadWorkoutSummary();
    } else {
        const err = await res.text();
        alert("Failed: " + err);
    }
}

function resetForm() {
    document.getElementById("exerciseTypeDropdown").selectedIndex = 0;
    document.getElementById("duration").value = "";
    document.getElementById("calories").value = "";
    document.getElementById("rate").value = "";
    editingWorkoutId = null;
    document.getElementById("action-btn").innerText = "Add Workout";
}

async function loadWorkouts() {
    const res = await fetch(`${apiBaseUrl}/Workout/user`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    window.workoutData = data;

    // Filter based on selected exercise type
    filteredData = currentFilter === "all"
        ? data
        : data.filter(w => w.exerciseType === currentFilter);

    const list = document.getElementById("workout-list");
    list.innerHTML = "";

    filteredData.forEach(w => {
        const li = document.createElement("li");
        li.style.marginBottom = "10px";
        li.innerHTML = `
            <b>${w.exerciseType}</b> - ${w.durationMinutes} min, ${w.caloriesBurned} cal, HR: ${w.heartRate}
            <button onclick="editWorkout(${w.id})" style="margin-left:10px;">✏️</button>
            <button onclick="deleteWorkout(${w.id})" style="margin-left:5px;">🗑️</button>
        `;
        list.appendChild(li);
    });

    // Update Chart and Stats
    renderChart(filteredData);
    showComputedStats(filteredData);
    populateFilterDropdown(); // Update filter dropdown with current data

    document.getElementById("filterDropdown").value = currentFilter;

}


document.getElementById("download-chart").addEventListener("click", function () {
    const chartCanvas = document.getElementById("workoutChart");
    const link = document.createElement("a");
    link.download = "workout_summary_chart.png";
    link.href = chartCanvas.toDataURL("image/png");
    link.click();
});

async function deleteWorkout(id) {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    await fetch(`${apiBaseUrl}/Workout/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    loadWorkouts();
    loadWorkoutSummary();
}

function editWorkout(id) {
    const workout = window.workoutData.find(w => w.id === id);
    if (!workout) return;

    // Note: You may want to store and select the exerciseTypeId instead of name
    document.getElementById("exerciseTypeDropdown").value = workout.exerciseTypeId;
    document.getElementById("duration").value = workout.durationMinutes;
    document.getElementById("calories").value = workout.caloriesBurned;
    document.getElementById("rate").value = workout.heartRate;

    editingWorkoutId = id;
    document.getElementById("action-btn").innerText = "Update Workout";
}

async function loadWorkoutSummary() {
    const res = await fetch(`${apiBaseUrl}/Workout/summary`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();
    document.getElementById("summary").innerText = `Total Workouts Logged: ${data.total}`;
}

async function loadExerciseTypes() {
    const dropdown = document.getElementById("exerciseTypeDropdown");
    dropdown.innerHTML = '<option disabled selected value="">Select Exercise Type</option>';

    try {
        const res = await fetch(`${apiBaseUrl}/ExerciseType`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Unauthorized or failed to load exercise types");
        }

        const types = await res.json();

        types.forEach(type => {
            const option = document.createElement("option");
            option.value = type.id;
            option.textContent = `${type.name} (${type.shortCode})`;
            dropdown.appendChild(option);
        });

    } catch (err) {
        console.error("Error fetching exercise types:", err.message);
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
}

function renderChart(data) {
    const ctx = document.getElementById("workoutChart").getContext("2d");

    const labels = data.map(w => w.exerciseType);
    const calories = data.map(w => w.caloriesBurned);
    const duration = data.map(w => w.durationMinutes);
    const heartRate = data.map(w => w.heartRate);

    if (workoutChart) workoutChart.destroy();

    if (currentChartType === 'bar') {
        workoutChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Calories Burned',
                        data: calories,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)'
                    },
                    {
                        label: 'Duration (min)',
                        data: duration,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)'
                    },
                    {
                        label: 'Heart Rate',
                        data: heartRate,
                        backgroundColor: 'rgba(255, 206, 86, 0.6)'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: currentChartType === 'bar'
                            ? `Workout Overview${currentFilter !== "all" ? " — " + currentFilter : ""}`
                            : `Calories by Exercise Type${currentFilter !== "all" ? " — " + currentFilter : ""}`,
                        color: "#ffffff",
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        labels: {
                            color: "#ffffff",
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    } else if (currentChartType === 'pie') {
        if (currentFilter === "all") {
            const caloriesByType = {};
            data.forEach(w => {
                caloriesByType[w.exerciseType] = (caloriesByType[w.exerciseType] || 0) + w.caloriesBurned;
            });

            workoutChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(caloriesByType),
                    datasets: [{
                        label: 'Calories Burned',
                        data: Object.values(caloriesByType),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                            'rgba(255, 159, 64, 0.6)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Calories by Exercise Type`,
                            color: "#ffffff",
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            labels: {
                                color: "#ffffff",
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });

        } else {
            const total = data.length;

            const totalCalories = data.reduce((sum, w) => sum + w.caloriesBurned, 0);
            const totalDuration = data.reduce((sum, w) => sum + w.durationMinutes, 0);
            const totalHeartRate = data.reduce((sum, w) => sum + w.heartRate, 0);

            const avgCalories = (totalCalories / total).toFixed(1);
            const avgDuration = (totalDuration / total).toFixed(1);
            const avgHeartRate = (totalHeartRate / total).toFixed(1);

            workoutChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Calories Burned', 'Duration (min)', 'Heart Rate'],
                    datasets: [{
                        data: [avgCalories, avgDuration, avgHeartRate],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Average Distribution — ${data[0].exerciseType}`,
                            color: "#ffffff",
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            labels: {
                                color: "#ffffff",
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }

    }
}


function populateFilterDropdown() {
    const filterDropdown = document.getElementById("filterDropdown");
    const existingTypes = new Set();

    workoutData.forEach(w => existingTypes.add(w.exerciseType));

    // Reset dropdown
    filterDropdown.innerHTML = `<option value="all">All Exercise Types</option>`;

    Array.from(existingTypes).forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        filterDropdown.appendChild(option);
    });

    // Bind change event to filter workouts
    filterDropdown.addEventListener("change", (e) => {
        const selectedValue = e.target.value;

        // Update current filter
        currentFilter = selectedValue;

        // Update dropdown visually
        document.getElementById("filterDropdown").value = selectedValue;

        // Re-fetch + refresh
        loadWorkouts();
    });


}


document.getElementById("toggle-chart-btn").addEventListener("click", () => {
    currentChartType = currentChartType === 'bar' ? 'pie' : 'bar';
    document.getElementById("toggle-chart-btn").innerText =
        currentChartType === 'bar' ? 'Switch to Pie Chart' : 'Switch to Bar Chart';

    renderChart(filteredData); // ✅ Use filtered list
});



function downloadChart() {
    const canvas = document.getElementById("workoutChart");
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "workout_chart.png";
    a.click();
}


function showComputedStats(data) {
    if (!data || data.length === 0) {
        document.getElementById("computed-stats").innerText = "";
        return;
    }

    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const avgDuration = avg(data.map(w => w.durationMinutes)).toFixed(1);
    const avgCalories = avg(data.map(w => w.caloriesBurned)).toFixed(1);
    const avgHeartRate = avg(data.map(w => w.heartRate)).toFixed(1);

    document.getElementById("computed-stats").innerText =
        `💡 Averages — Duration: ${avgDuration} min | Calories: ${avgCalories} cal | HR: ${avgHeartRate}`;
}



// expose edit/delete for HTML
window.editWorkout = editWorkout;
window.deleteWorkout = deleteWorkout;
