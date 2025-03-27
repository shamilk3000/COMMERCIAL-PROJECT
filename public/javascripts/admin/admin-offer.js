let addstart = false;
document
  .getElementById("addCouponForm")
  .addEventListener("submit", function (event) {
    // Prevent actual form submission

    let couponCode = document.getElementById("couponCode").value.trim();
    let offer = document.getElementById("offer").value.trim();
    let minPrice = document.getElementById("minPrice").value.trim();
    let maxPrice = document.getElementById("maxPrice").value.trim();
    let expiresAt = document.getElementById("expiresAt").value.trim();

    if (!couponCode) {
      Swal.fire({
        title: "SORRY!",
        text: "Coupon Code is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (couponCode.length != 4) {
      Swal.fire({
        title: "SORRY!",
        text: "The coupon code must be a four-digit numeric value.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!offer) {
      Swal.fire({
        title: "SORRY!",
        text: "Offer is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!minPrice) {
      Swal.fire({
        title: "SORRY!",
        text: "Min Price is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!maxPrice) {
      Swal.fire({
        title: "SORRY!",
        text: "Max Price is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (parseInt(minPrice) >= parseInt(maxPrice)) {
      Swal.fire({
        title: "SORRY!",
        text: "Max Price must be greater than Min Price.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (parseInt(offer) <= parseInt(minPrice) || parseInt(offer) >= parseInt(maxPrice)) {
      Swal.fire({
        title: "SORRY!",
        text: "Offer Amount must be between Min Price and Max Price.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!expiresAt) {
      Swal.fire({
        title: "SORRY!",
        text: "Select expire date.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else {
      addstart = true;
    }
  });

async function addCoupon() {
  try {
    if (addstart) {
      let couponCode = document.getElementById("couponCode").value.trim();
      let offer = document.getElementById("offer").value.trim();
      let minPrice = document.getElementById("minPrice").value.trim();
      let maxPrice = document.getElementById("maxPrice").value.trim();
      let expiresAt = document.getElementById("expiresAt").value.trim();
      const response = await fetch("/admin/api/addCoupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode, offer, minPrice, maxPrice, expiresAt }),
      });

      const data = await response.json();
      if (data.added == true) {
        location.reload();
      } else {
        Swal.fire({
          title: "Sorry",
          text: "Coupon Code is already exists",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  } catch (error) {
    console.error("Error add coupon:", error);
  }
}

function show(code, offer, min, max, id, expire) {
  let preselectedDate = ""
  let editDateRange = document.getElementById("editExpiresAt");
  editDateRange.value=""
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  preselectedDate = new Date(expire);
  let picker = flatpickr(editDateRange, {
    dateFormat: "d-m-Y",  
    minDate: tomorrow ,
    defaultDate: preselectedDate,
  });
  if(editDateRange.value.trim()==""){
    editDateRange.placeholder=`Expired in ${preselectedDate}`
  }


  document.getElementById("editcouponCode").value = code;
  document.getElementById("editoffer").value = offer;
  document.getElementById("editminPrice").value = min;
  document.getElementById("editmaxPrice").value = max;
  document.getElementById("id").value = id;
 
}



let editstart = false;
document
  .getElementById("editCouponForm")
  .addEventListener("submit", function (event) {
    // Prevent actual form submission

    let couponCode = document.getElementById("editcouponCode").value.trim();
    let offer = document.getElementById("editoffer").value.trim();
    let minPrice = document.getElementById("editminPrice").value.trim();
    let maxPrice = document.getElementById("editmaxPrice").value.trim();
    let editExpiresAt = document.getElementById("editExpiresAt").value.trim();

    if (!couponCode) {
      Swal.fire({
        title: "SORRY!",
        text: "Coupon Code is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (couponCode.length != 4) {
      Swal.fire({
        title: "SORRY!",
        text: "The coupon code must be a four-digit numeric value.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!offer) {
      Swal.fire({
        title: "SORRY!",
        text: "Offer is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!minPrice) {
      Swal.fire({
        title: "SORRY!",
        text: "Min Price is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!maxPrice) {
      Swal.fire({
        title: "SORRY!",
        text: "Max Price is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (parseInt(minPrice) >= parseInt(maxPrice)) {
      Swal.fire({
        title: "SORRY!",
        text: "Max Price must be greater than Min Price.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (parseInt(offer) <= parseInt(minPrice) || parseInt(offer) >= parseInt(maxPrice)) {
      Swal.fire({
        title: "SORRY!",
        text: "Offer Amount must be between Min Price and Max Price.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else if (!editExpiresAt) {
      Swal.fire({
        title: "SORRY!",
        text: "Select expire date.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else {
      editstart = true;
    }
  });

async function editCoupon() {
  try {
    if (editstart) {
      let couponCode = document.getElementById("editcouponCode").value.trim();
      let offer = document.getElementById("editoffer").value.trim();
      let minPrice = document.getElementById("editminPrice").value.trim();
      let maxPrice = document.getElementById("editmaxPrice").value.trim();
      let expiresAt = document.getElementById("editExpiresAt").value.trim();
      // let status = document.getElementById("isActive").value;
      let id = document.getElementById("id").value;

      const response = await fetch("/admin/api/editCoupon", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          couponCode,
          offer,
          minPrice,
          maxPrice,
          expiresAt
        }),
      });

      const data = await response.json();
      if (data.editted == true) {
        location.reload();
      } else {
        Swal.fire({
          title: "Sorry",
          text: "Coupon Code is already exists",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  } catch (error) {
    console.error("Error edit coupon:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  let dateRange = document.getElementById("expiresAt");
  let editDateRange = document.getElementById("editExpiresAt");
    
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  

  flatpickr(dateRange, {
    dateFormat: "d-m-Y",  
    minDate: tomorrow 
  });
  flatpickr(editDateRange, {
    dateFormat: "d-m-Y",  
    minDate: tomorrow 
  });

});