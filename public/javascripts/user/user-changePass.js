//-----------------------------------------------------------------------------------------------------------------------
//heder sidil varaan
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const closeSidebar = document.getElementById("closeSidebar");
const menuOverlay = document.getElementById("menuOverlay");

menuToggle.addEventListener("click", () => {
  sidebar.classList.add("active");
  menuOverlay.classList.add("active");
});

closeSidebar.addEventListener("click", () => {
  sidebar.classList.remove("active");
  menuOverlay.classList.remove("active");
});

menuOverlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  menuOverlay.classList.remove("active");
});


let editstart = false;
document
  .getElementById("editPass")
  .addEventListener("submit", function (event) {
    // Prevent actual form submission

    let pass = document.getElementById("password").value.trim();
    let cpass = document.getElementById("confirmpassword").value.trim();
    let currentpass = document.getElementById("currentpass").value.trim();

    if (pass != cpass) {
      Swal.fire({
        title: "SORRY!",
        text: "The password and confirm password do not match.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (
      !pass ||
      !cpass 
    ) {
      Swal.fire({
        title: "SORRY!",
        text: "All fields are required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    }else if (
      !currentpass
    ) {
      Swal.fire({
        title: "SORRY!",
        text: "Enter the current password",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else {
      editstart = true;
    }
  });

  

  async function editPass() {
    try {
        let password = document.getElementById("password").value;
         let confirmPassword = document.getElementById("confirmpassword").value;
         let currentpass = document.getElementById("currentpass").value;
  
      if (editstart) {
        console.log("changing password...");
        const response = await fetch("/api/changePasssub", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password,
            confirmPassword,
            currentpass,
          }),
        });
        const data = await response.json();
        if (data.changed == true) {
            document.getElementById("password").value = ""
            document.getElementById("confirmpassword").value = ""
            document.getElementById("currentpass").value = ""
            Swal.fire({
                title: "Success!",
                text: "Password has been changed.",
                icon: "success",
                confirmButtonText: "OK",
              });
        } else {
          Swal.fire({
            title: "Sorry!",
            text: "Current password is not match",
            icon: "info",
            confirmButtonText: "OK",
          });
        }
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  }

  document.getElementById("togglePassword").addEventListener("click", function () {
    let passwordInput = document.getElementById("password");
    let confirmpassword = document.getElementById("confirmpassword");
    let currentpass = document.getElementById("currentpass");
    let icon = this.querySelector("i");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        confirmpassword.type = "text";
        currentpass.type = "text";
        icon.classList.remove("bi-eye-fill");
        icon.classList.add("bi-eye-slash-fill");
    } else {
        passwordInput.type = "password";
        confirmpassword.type = "password";
        currentpass.type = "password";
        icon.classList.remove("bi-eye-slash-fill");
        icon.classList.add("bi-eye-fill");
    }
});