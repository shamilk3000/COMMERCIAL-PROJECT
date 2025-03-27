window.onload = function () {
  const [nav] = performance.getEntriesByType("navigation");

  if (nav && nav.type === "reload") {
  } else {
    const warning = document.getElementById("warning").innerText;
    if (warning) {
      Swal.fire({
        title: "SORRY!",
        text: warning,
        icon: "info",
        confirmButtonText: "OK",
      });
    }
    const completed = document.getElementById("completed").innerText;
    if (completed) {
      Swal.fire({
        title: "Success!",
        text: completed,
        icon: "success",
        confirmButtonText: "OK",
      });
    }
  }
};
function validateLoginForm(event) {
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  if (email.value.trim() === "") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Email is required..",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (!validateEmail(email.value)) {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Please enter a valid email address.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (password.value.trim() === "") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Password is required.",
      icon: "info",
      confirmButtonText: "OK",
    });
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

document.querySelector("form").addEventListener("submit", validateLoginForm);

document.getElementById("togglePassword").addEventListener("click", function () {
  let passwordInput = document.getElementById("password");
  let icon = this.querySelector("i");

  if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("bi-eye-fill");
      icon.classList.add("bi-eye-slash-fill");
  } else {
      passwordInput.type = "password";
      icon.classList.remove("bi-eye-slash-fill");
      icon.classList.add("bi-eye-fill");
  }
});