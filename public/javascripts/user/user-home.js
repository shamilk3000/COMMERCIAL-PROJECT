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
//alert showing
window.onload = function () {
  const [nav] = performance.getEntriesByType("navigation");

  if (nav && nav.type === "reload") {
  } else {
    const completed = document.getElementById("completed").innerText;
    if (completed) {
      Swal.fire({
        title: "Success!",
        text: completed,
        icon: "success",
        confirmButtonText: "OK",
      });
    }
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

  let search = document.getElementById("filterData").innerText
  if(search != ""){
    search = JSON.parse(search)







    if (search.name?.trim()) {
      document.getElementById("search").value=search.name
    }
    if (search.size && search.size !== "undefined") {
      const selectedSize =search.size; 
      const sizeSelect = document.getElementById("size");
  
      if (sizeSelect) {
          for (let option of sizeSelect.options) {
              if (option.value === selectedSize) {
                  option.selected = true;
                  break;
              }
          }
      }
    }
    if (search.category && search.category !== "undefined") {
      const selectedCategory =search.category; 
      const categorySelect = document.getElementById("category");

      if (categorySelect) {
        for (let option of categorySelect.options) {
            if (option.value === selectedCategory) {
                option.selected = true;
                break;
            }
        }
    }
    }
    if (search.stock && search.stock !== "undefined") {
      const selectedstock =search.stock; 
      const stockSelect = document.getElementById("fs");
      
      if (stockSelect) {
        for (let option of stockSelect.options) {
            if (option.value === selectedstock) {
                option.selected = true;
                break;
            }
        }
    }
      
    }

    if (search.order && search.order !== "undefined") {
      const selectedOder =search.order; 
      const oderSelect = document.getElementById("order");
      
      if (oderSelect) {
        for (let option of oderSelect.options) {
            if (option.value === selectedOder) {
                option.selected = true;
                break;
            }
        }
    }
    }














  }

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
