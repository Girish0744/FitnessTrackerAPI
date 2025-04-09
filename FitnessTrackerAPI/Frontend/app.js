const apiBaseUrl = "https://localhost:7283/api";
let token = localStorage.getItem("token");
let editingWorkoutId = null;


// ==== AUTH ====

async function register() {
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    const res = await fetch(`${apiBaseUrl}/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    });

    const data = await res.text();
    alert(data);
}

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch(`${apiBaseUrl}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
    } else {
        alert("Login failed");
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

// ==== WORKOUTS ====

async function addWorkout() {
    const exerciseType = document.getElementById("type").value.trim();
    const durationMinutes = parseInt(document.getElementById("duration").value);
    const caloriesBurned = parseInt(document.getElementById("calories").value);
    const heartRate = parseInt(document.getElementById("rate").value);

    if (!exerciseType || isNaN(durationMinutes) || isNaN(caloriesBurned) || isNaN(heartRate)) {
        alert("All fields are required and must be valid numbers.");
        return;
    }

    const workoutData = {
        exerciseType,
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
        resetForm(); // ⬅️ clears form & resets mode
        loadWorkouts();
        loadWorkoutSummary();
    } else {
        const errorText = await res.text();
        alert("Failed to submit workout: " + errorText);
    }
}


function editWorkout(workout) {
    document.getElementById("workout-id").value = workout.id;
    document.getElementById("type").value = workout.exerciseType;
    document.getElementById("duration").value = workout.durationMinutes;
    document.getElementById("calories").value = workout.caloriesBurned;
    document.getElementById("rate").value = workout.heartRate;

    const btn = document.querySelector("button[onclick='addWorkout()']");
    btn.textContent = "Update Workout";
}

function resetForm() {
    document.getElementById("workout-id").value = "";
    document.getElementById("type").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("calories").value = "";
    document.getElementById("rate").value = "";

    const btn = document.querySelector("button[onclick='addWorkout()']");
    btn.textContent = "Add Workout";
}



async function loadWorkouts() {
    const res = await fetch(`${apiBaseUrl}/Workout/user`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (res.status === 401) {
        alert("Session expired. Please login again.");
        logout();
        return;
    }

    const workouts = await res.json();
    document.workoutData = workouts; // 🆕 store all workouts
    const list = document.getElementById("workout-list");
    list.innerHTML = "";

    workouts.forEach(w => {
        const li = document.createElement("li");
        li.innerHTML = `
        <b>${w.exerciseType}</b> - ${w.durationMinutes} min, ${w.caloriesBurned} cal, HR: ${w.heartRate}
        <button onclick="deleteWorkout(${w.id})">🗑</button>
        <button onclick="editWorkout(${w.id})">✏️</button>
          `;
        list.appendChild(li);
    });

}


async function deleteWorkout(id) {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    await fetch(`${apiBaseUrl}/Workout/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    loadWorkouts();
}

async function loadWorkoutSummary() {
    const res = await fetch(`${apiBaseUrl}/Workout/summary`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.status === 401) {
        alert("Session expired. Please login again.");
        logout();
        return;
    }

    const data = await res.json();
    document.getElementById("summary").innerText = `Total Workouts Logged: ${data.total}`;
}

function resetForm() {
    document.getElementById("type").value = "";
    document.getElementById("duration").value = "";
    document.getElementById("calories").value = "";
    document.getElementById("rate").value = "";
    editingWorkoutId = null;
    document.querySelector("button").innerText = "Add Workout";
}

function editWorkout(id) {
    const workout = document.workoutData.find(w => w.id === id);
    if (!workout) return;

    document.getElementById("type").value = workout.exerciseType;
    document.getElementById("duration").value = workout.durationMinutes;
    document.getElementById("calories").value = workout.caloriesBurned;
    document.getElementById("rate").value = workout.heartRate;

    editingWorkoutId = id;
    document.querySelector("button").innerText = "Update Workout";
}


// ==== AUTOLOAD ON DASHBOARD ====
if (window.location.pathname.includes("dashboard.html")) {
    if (!token) window.location.href = "index.html";
    loadWorkouts();
    loadWorkoutSummary();
}

