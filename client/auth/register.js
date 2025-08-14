// Register form and logic
const registerForm = document.createElement("form");
registerForm.innerHTML = `
  <h2>Register</h2>
  <input name="email" type="email" placeholder="Email" required />
  <input name="password" type="password" placeholder="Password" required />
  <button type="submit">Register</button>
  <div id="register-error" style="color:red"></div>
  <div style="margin-top:1rem;text-align:center;">
    <button id="theme-toggle" type="button">Toggle Dark/Light Theme</button>
  </div>
`;
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.onclick = function () {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem(
        "theme",
        document.body.classList.contains("dark-mode") ? "dark" : "light"
      );
    };
    // Set theme on load
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
    }
  }
});
registerForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = registerForm.email.value;
  const password = registerForm.password.value;
  const res = await fetch("http://3.229.166.20:4000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.message) {
    alert("Registration successful! Please log in.");
    window.location.reload();
  } else {
    document.getElementById("register-error").textContent =
      data.error || "Registration failed";
  }
};
document.getElementById("auth-root").appendChild(registerForm);
