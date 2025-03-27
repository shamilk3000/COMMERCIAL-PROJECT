function validateUserForm(event) {
  // Get form elements
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const phoneNumber = document.getElementById("phoneNumber");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  if (username.value.trim() === "") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Username is required",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (email.value.trim() === "") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Email is required.",
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
  } else if (
    phoneNumber.value.trim() !== "" &&
    !validatePhoneNumber(phoneNumber.value)
  ) {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Please enter a valid phone number.",
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
}
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhoneNumber(phoneNumber) {
  const re = /^\d{10}$/;
  return re.test(phoneNumber);
}
document.querySelector("form").addEventListener("submit", validateUserForm);





  




window.onload = function () {
  const [nav] = performance.getEntriesByType("navigation");
  
  if (nav && nav.type === "reload") {
  } else {
    const existMail = document.getElementById("existMail").innerText;
  if (existMail) {
    Swal.fire({
      title: "SORRY!",
      text: existMail,
      icon: "info",
      confirmButtonText: "OK",
    });
  };
  }
};


