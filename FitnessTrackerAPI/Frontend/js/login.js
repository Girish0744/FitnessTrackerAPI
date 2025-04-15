const apiBaseUrl = "https://localhost:7283/api";

document.getElementById("login-btn").addEventListener("click", async () => {
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
        document.getElementById("message").innerText = "Login failed. Please check your credentials.";
    }
});
