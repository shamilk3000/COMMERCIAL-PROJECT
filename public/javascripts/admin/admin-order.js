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
    console.log("Page was manually refreshed.");
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
    console.log("Page loaded for the first time.");
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

  allBtn.classList.replace("btn-danger", "btn-light");
  pending.classList.replace("btn-danger", "btn-light");
  delivered.classList.replace("btn-danger", "btn-light");
  cancelled.classList.replace("btn-danger", "btn-light");

  if (button == "p") {
    pending.classList.replace("btn-light", "btn-danger");
  } else if (button == "d") {
    delivered.classList.replace("btn-light", "btn-danger");
  } else if (button == "c") {
    cancelled.classList.replace("btn-light", "btn-danger");
  } else if (button != "p" && button != "d" && button != "c") {
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
