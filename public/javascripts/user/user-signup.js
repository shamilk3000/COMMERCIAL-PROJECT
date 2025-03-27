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
  }
};

// Form validation for user signup
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const phoneNumber = document.getElementById("phoneNumber");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  form.addEventListener("submit", function (event) {
    let isValid = true;

    // Username validation (minimum 3 characters)
    if (username.value.trim().length < 0) {
      showError(username, "Please provide a username");
      isValid = false;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
      showError(email, "Please enter a valid email address");
      isValid = false;
    }

    // Phone number validation (optional field)
    if (phoneNumber.value) {
      const phonePattern = /^\d{10}$/;
      if (!phonePattern.test(phoneNumber.value.trim())) {
        showError(phoneNumber, "Please enter a valid 10-digit phone number");
        isValid = false;
      }
    }

    // Password validation (minimum 6 characters)
    if (password.value.trim().length < 0) {
      showError(password, "Please provide a password");
      isValid = false;
    }

    // Confirm password validation
    if (password.value !== confirmPassword.value) {
      showError(confirmPassword, "Passwords do not match");
      isValid = false;
    }

    if (!isValid) {
      event.preventDefault();
    }
  });

  function showError(input, message) {
    const formGroup = input.parentElement;
    const errorDiv =
      formGroup.querySelector(".error-message") ||
      createErrorElement(formGroup);
    errorDiv.textContent = message;
  }

  function createErrorElement(formGroup) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message text-danger mt-1";
    formGroup.appendChild(errorDiv);
    return errorDiv;
  }

  // Clear error messages on input
  [username, email, phoneNumber, password, confirmPassword].forEach((input) => {
    input.addEventListener("input", function () {
      const errorDiv = this.parentElement.querySelector(".error-message");
      if (errorDiv) {
        errorDiv.remove();
      }
    });
  });
});


document.getElementById("togglePassword").addEventListener("click", function () {
  let passwordInput = document.getElementById("password");
  let confirmPassword = document.getElementById("confirmPassword");
  let icon = this.querySelector("i");

  if (passwordInput.type === "password") {
      passwordInput.type = "text";
      confirmPassword.type = "text";
      icon.classList.remove("bi-eye-fill");
      icon.classList.add("bi-eye-slash-fill");
  } else {
      passwordInput.type = "password";
      confirmPassword.type = "password";
      icon.classList.remove("bi-eye-slash-fill");
      icon.classList.add("bi-eye-fill");
  }
});