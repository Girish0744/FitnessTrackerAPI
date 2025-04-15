const apiBaseUrl = "https://localhost:7283/api";

document.getElementById("register-btn").addEventListener("click", async () => {
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    const res = await fetch(`${apiBaseUrl}/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    });

    const msg = document.getElementById("message");

    if (res.ok) {
        msg.innerText = "Registered successfully! Redirecting to login...";
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    } else {
        const err = await res.text();
        msg.innerText = err || "Registration failed.";
    }
});
