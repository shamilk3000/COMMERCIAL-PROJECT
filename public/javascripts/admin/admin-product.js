function view(
  name,
  brand,
  price,
  category,
  size,
  colors,

  quantity,
  createdBy,
  createdAt,
  updatedBy,
  updatedAt,
  productImage,
  offer,
  offerPrice,
  catoff
) {
  const description = document
    .getElementById("but")
    .getAttribute("data-description");
  document.getElementById("viewname").value = name;
  document.getElementById("viewbrand").value = brand;
  document.getElementById("viewprice").value = price;
  document.getElementById("offer").value = `${catoff}% + ${offer}% offer `;
  document.getElementById("offerPrice").value = offerPrice;
  document.getElementById("viewcategory").value = category;
  document.getElementById("viewsize").value = size;
  document.getElementById("viewcolors").value = colors;
  document.getElementById("viewdescription").value = description;
  document.getElementById("viewstock").value = quantity;
  document.getElementById("viewcreatedBy").value = createdBy;
  document.getElementById("viewcreatedAt").value = createdAt;
  document.getElementById("viewupdatedBy").value = updatedBy;
  document.getElementById("viewupdatedAt").value = updatedAt;

  const imageDatas = productImage.split(/<split>,|<split>/);
  imageDatas.pop();
  let html = "";
  for (const data of imageDatas) {
    html =
      html +
      `<div class="card col-5 align-items-center justify-content-center p-2 rounded border border-2 border-success border-opacity-50" >
         <img class="img-fluid " src="${data}" alt="Image">
      </div>`;
  }
  document.getElementById("modalImageContainer").innerHTML = html;
}

function deleteUser(id, name, brand, category, isDeleted) {
  document.getElementById("deleteid").value = id;
  let deleteButtontext = "";
  let warningText = "";
  let staticBackdropLabel = "";

  if (isDeleted == "true") {
    staticBackdropLabel = " Restore Product ";
    warningText = `<h6 class="lh-lg">Are you sure you want to restore <strong>${brand}</strong>'s <strong>${name}</strong> to category <strong>${category}</strong></h6>`;
    deleteButtontext = " Restore ";
  } else {
    staticBackdropLabel = " Delete Product ";
    warningText = `<h6 class="lh-lg">Are you sure you want to delete <strong>${brand}</strong>'s <strong>${name}</strong> from category <strong>${category}</strong></h6>`;
    deleteButtontext = "Delete";
  }
  document.getElementById("deleteHed").innerText = staticBackdropLabel;
  document.getElementById("warningText").innerHTML = warningText;
  document.getElementById("deleteButtontext").innerText = deleteButtontext;
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
  const instockBtn = document.getElementById("instockBtn");
  const outofstockBtn = document.getElementById("outofstockBtn");

  allBtn.classList.replace("btn-danger", "btn-light");
  instockBtn.classList.replace("btn-danger", "btn-light");
  outofstockBtn.classList.replace("btn-danger", "btn-light");

  if (button == "in") {
    instockBtn.classList.replace("btn-light", "btn-danger");
  } else if (button == "out") {
    outofstockBtn.classList.replace("btn-light", "btn-danger");
  } else if (button != "in" && button != "out") {
    allBtn.classList.replace("btn-light", "btn-danger");
  }
};

const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
const appendAlert = function (message, type) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <a href="/admin/productManagement"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></a>',
    "</div>",
  ].join("");
  alertPlaceholder.append(wrapper);
};
