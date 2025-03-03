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
  console.log(btnid);
  console.log(btn);
  btn.classList.replace("btn-light", "btn-dark");
};
//category div show and hide also btm colour changes
// document.addEventListener('DOMContentLoaded', function() {
//     const allProductsBtn = document.getElementById('allProductsBtn');
//     const womenBtn = document.getElementById('womenBtn');
//     const menBtn = document.getElementById('menBtn');

//     const allProductsDiv = document.getElementById('allProductsDiv');
//     const womenDiv = document.getElementById('womenDiv');
//     const menDiv = document.getElementById('menDiv');

//     function setActiveButton(activeBtn) {
//         [allProductsBtn, womenBtn, menBtn].forEach(btn => {
//             btn.classList.remove('btn-dark');
//             btn.classList.add('btn-light');
//         });
//         activeBtn.classList.remove('btn-light');
//         activeBtn.classList.add('btn-dark');
//     }

//     function showDiv(divToShow) {
//         [allProductsDiv, womenDiv, menDiv].forEach(div => {
//             div.style.display = 'none';
//         });
//         divToShow.style.display = 'block';
//     }

//     allProductsBtn.addEventListener('click', function() {
//         setActiveButton(this);
//         showDiv(allProductsDiv);
//     });

//     womenBtn.addEventListener('click', function() {
//         setActiveButton(this);
//         showDiv(womenDiv);
//     });

//     menBtn.addEventListener('click', function() {
//         setActiveButton(this);
//         showDiv(menDiv);
//     });
// });
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
