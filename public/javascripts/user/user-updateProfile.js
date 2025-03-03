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
  .getElementById("editProfile")
  .addEventListener("submit", function (event) {

    let firstName = document.getElementById("firstName").value.trim();
    let lastName = document.getElementById("lastName").value.trim();
    let email = document.getElementById("email").value.trim();
    let username = document.getElementById("username").value.trim();
    let mobile = document.getElementById("mobile").value.trim();
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let mobilePattern = /^[0-9]{10}$/;

    if (!firstName || !lastName || !email || !username || !mobile) {
      Swal.fire({
        title: "SORRY!",
        text: "All fields are required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!emailPattern.test(email)) {
      Swal.fire({
        title: "SORRY!",
        text: "Please enter a valid email address.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!mobilePattern.test(mobile)) {
      Swal.fire({
        title: "SORRY!",
        text: "Please enter a valid 10-digit phone number.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else {
      editstart = true;
    }
  });

async function editProfile() {
  try {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let username = document.getElementById("username").value;
    let mobile = document.getElementById("mobile").value;

    if (editstart) {
      console.log("editing profile");
      const response = await fetch("/api/editProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          mobile,
        }),
      });
      const data = await response.json();
      if (data.edit == true) {
        location.reload();
      } else {
        Swal.fire({
          title: "Sorry!",
          text: "error updating",
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    }
  } catch (error) {
    console.error("Error editing address:", error);
  }
}
