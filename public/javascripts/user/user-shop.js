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

//-----------------------------------------------------------------------------------------------------------------------------
window.onload = () => {
  const btnid = document.getElementById("button").innerText;
  const btn = document.getElementById(btnid);
  btn.classList.replace("btn-light", "btn-dark");
};
//-----------------------------------------------------------------------------------------------------------------------------
document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    let searchInput = document.getElementById("searchInput").value.trim();

    if (searchInput === "") {
      event.preventDefault(); // Prevent form submission
      Swal.fire({
        title: "SORRY!",
        text: "Please enter a search term.",
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  });
