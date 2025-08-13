// Login form and logic
const loginForm = document.createElement("form");
loginForm.innerHTML = `
  <h2>Login</h2>
  <input name="email" type="email" placeholder="Email" required />
  <input name="password" type="password" placeholder="Password" required />
  <button type="submit">Login</button>
  <div id="login-error" style="color:red"></div>
  <div style="margin-top:1rem;text-align:center;">
    <button id="theme-toggle" type="button">Toggle Dark/Light Theme</button>
  </div>
`;
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.onclick = function () {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    };
    // Set theme on load
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
    }
  }
});
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;
  const res = await fetch("http://3.229.166.20:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.reload();
  } else {
    document.getElementById("login-error").textContent =
      data.error || "Login failed";
  }
};
document.getElementById("auth-root").appendChild(loginForm);
