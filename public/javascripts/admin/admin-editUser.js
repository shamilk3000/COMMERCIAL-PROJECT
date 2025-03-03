const activateBtn = document.getElementById("activateBtn");
const blockBtn = document.getElementById("blockBtn");

activateBtn.addEventListener("click", () => {
  document.getElementById("isActive").value = "true";
  activateBtn.classList.add("active");
  activateBtn.classList.remove("inactive");
  blockBtn.classList.remove("block");
  blockBtn.classList.add("inactive");
});

blockBtn.addEventListener("click", () => {
  document.getElementById("isActive").value = "false";
  blockBtn.classList.add("block");
  blockBtn.classList.remove("inactive");
  activateBtn.classList.remove("active");
  activateBtn.classList.add("inactive");
});

let pass = "";
window.onload = function () {
  pass = document.getElementById("password").value;
  document.getElementById("password").addEventListener("focus", function () {
    this.value = "";
  });
  document
    .getElementById("confirmPassword")
    .addEventListener("focus", function () {
      this.value = "";
    });
  document.getElementById("password").addEventListener("blur", function () {
    if (document.getElementById("password").value == "") {
      document.getElementById("password").value = pass;
    }
  });
  document
    .getElementById("confirmPassword")
    .addEventListener("blur", function () {
      if (document.getElementById("confirmPassword").value == "") {
        document.getElementById("confirmPassword").value = pass;
      }
    });

  const data = document.getElementById("isActiveData").value;

  if (data == "true") {
    document.getElementById("isActive").value = "true";
    activateBtn.classList.add("active");
    activateBtn.classList.remove("inactive");
    blockBtn.classList.remove("block");
    blockBtn.classList.add("inactive");
  } else {
    document.getElementById("isActive").value = "false";
    blockBtn.classList.add("block");
    blockBtn.classList.remove("inactive");
    activateBtn.classList.remove("active");
    activateBtn.classList.add("inactive");
  }

  const noMatch = document.getElementById("noMatch").innerText;
  if (noMatch) {
    Swal.fire({
      title: "SORRY!",
      text: noMatch,
      icon: "info",
      confirmButtonText: "OK",
    });
  }
};
function validateUserForm(event) {
  // Get form elements
  const username = document.getElementById("username");
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
  } else if (pass) {
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
  }
}
function validatePhoneNumber(phoneNumber) {
  const re = /^\d{10}$/;
  return re.test(phoneNumber);
}
document.querySelector("form").addEventListener("submit", validateUserForm);
