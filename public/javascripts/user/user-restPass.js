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

document
  .getElementById("resetForm")
  .addEventListener("submit", function (event) {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    if (password.value.trim() === "") {
      event.preventDefault();
      Swal.fire({
        title: "SORRY!",
        text: "Password is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
    } else if (confirmPassword.value.trim() === "") {
      event.preventDefault();
      Swal.fire({
        title: "SORRY!",
        text: "Confirm Password is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
    } else if (password.value !== confirmPassword.value) {
      event.preventDefault();
      Swal.fire({
        title: "SORRY!",
        text: "Passwords do not match.",
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  });
