function edit(id, shipped, outForDelivery, delivered) {
  // Set the order ID
  document.getElementById("orderId").value = id;

  shipped = shipped === "true" || shipped === true;
  outForDelivery = outForDelivery === "true" || outForDelivery === true;
  delivered = delivered === "true" || delivered === true;

  // Set radio buttons for Shipped
  document.getElementById("shippedYes").checked = shipped;
  document.getElementById("shippedNo").checked = !shipped;

  // Set radio buttons for Out for Delivery
  document.getElementById("outForDeliveryYes").checked = outForDelivery;
  document.getElementById("outForDeliveryNo").checked = !outForDelivery;

  // Set radio buttons for Delivered
  document.getElementById("deliveredYes").checked = delivered;
  document.getElementById("deliveredNo").checked = !delivered;
}

async function editSub() {
  try {
    let id = document.getElementById("orderId").value;
    let shipped =
      document.querySelector('input[name="shipped"]:checked').value === "true";
    let outForDelivery =
      document.querySelector('input[name="outForDelivery"]:checked').value ===
      "true";
    let delivered =
      document.querySelector('input[name="delivered"]:checked').value ===
      "true";

    const response = await fetch("/admin/api/orderStatus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, shipped, outForDelivery, delivered }),
    });
    const data = await response.json();
    if (data.status == true) {
      location.reload();
    } else {
      Swal.fire({
        title: "Sorry!",
        text: data.error,
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error("Error edit status:", error);
  }
}

window.onload = function () {
  const [nav] = performance.getEntriesByType("navigation");

  if (nav && nav.type === "reload") {
  } else {
    const warningInfo = document.getElementById("warningInfo").innerText;
    if (warningInfo) {
      Swal.fire({
        title: "SORRY!",
        text: warningInfo,
        icon: "info",
        confirmButtonText: "OK",
      });
    }

    const warning = document.getElementById("warning").innerText;
    if (warning) {
      Swal.fire({
        title: "Success!",
        text: warning,
        icon: "success",
        confirmButtonText: "OK",
      });
    }
  }

  const type = document.getElementById("type").innerText;
  const searchresult = document.getElementById("searchresult").innerText;
  if (searchresult) {
    appendAlert(searchresult, type);
  }

  const button = document.getElementById("button").innerText;
  const allBtn = document.getElementById("allBtn");
  const pending = document.getElementById("pending");
  const delivered = document.getElementById("delivered");
  const cancelled = document.getElementById("cancelled");
  const returned = document.getElementById("returned");

  allBtn.classList.replace("btn-danger", "btn-light");
  pending.classList.replace("btn-danger", "btn-light");
  delivered.classList.replace("btn-danger", "btn-light");
  cancelled.classList.replace("btn-danger", "btn-light");
  returned.classList.replace("btn-danger", "btn-light");

  if (button == "p") {
    pending.classList.replace("btn-light", "btn-danger");
  } else if (button == "d") {
    delivered.classList.replace("btn-light", "btn-danger");
  } else if (button == "c") {
    cancelled.classList.replace("btn-light", "btn-danger");
  } else if (button == "r") {
    returned.classList.replace("btn-light", "btn-danger");
  } else if (button != "p" && button != "d" && button != "c" && button != "r") {
    allBtn.classList.replace("btn-light", "btn-danger");
  }
};

const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
const appendAlert = function (message, type) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <a href="/admin/orderManagement"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></a>',
    "</div>",
  ].join("");
  alertPlaceholder.append(wrapper);
};

function address (id) {
  let add = document.getElementById(id).value;
  add =  JSON.parse(add)
  document.getElementById("firstName").value = add.firstName || "";
  document.getElementById("lastName").value = add.lastName || "";
  document.getElementById("email").value = add.email || "";
  document.getElementById("mobile").value = add.mobile || "";
  document.getElementById("pincode").value = add.pincode || "";
  document.getElementById("address").value = add.address || "";
  document.getElementById("area").value = add.area || "";
  document.getElementById("landmark").value = add.landmark || "";
  document.getElementById("city").value = add.city || "";
  document.getElementById("state").value = add.state || "";
}


document.addEventListener("DOMContentLoaded", function () {
  const shippedYes = document.getElementById("shippedYes");
  const shippedNo = document.getElementById("shippedNo");

  const outForDeliveryYes = document.getElementById("outForDeliveryYes");
  const outForDeliveryNo = document.getElementById("outForDeliveryNo");

  const deliveredYes = document.getElementById("deliveredYes");
  const deliveredNo = document.getElementById("deliveredNo");

  deliveredYes.addEventListener("change", function () {
      if (deliveredYes.checked) {
          shippedYes.checked = true;
          outForDeliveryYes.checked = true;
      }
  });

  outForDeliveryYes.addEventListener("change", function () {
      if (outForDeliveryYes.checked) {
          shippedYes.checked = true;
          deliveredNo.checked = true;
      }
  });

  shippedNo.addEventListener("change", function () {
      if (shippedNo.checked) {
          deliveredNo.checked = true;
          outForDeliveryNo.checked = true;
      }
  });

  outForDeliveryNo.addEventListener("change", function () {
      if (outForDeliveryNo.checked) {
          deliveredNo.checked = true;
      }
  });
});
