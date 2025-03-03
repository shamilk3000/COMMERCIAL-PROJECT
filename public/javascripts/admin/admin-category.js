function view(
  categoryName,
  description,
  createdBy,
  createdAt,
  updatedBy,
  updatedAt,
  total,
  offer
) {
  document.getElementById("categoryName").value = categoryName;
  document.getElementById("description").value = description;
  document.getElementById("createdBy").value = createdBy;
  document.getElementById("createdAt").value = createdAt;
  document.getElementById("updatedBy").value = updatedBy;
  document.getElementById("updatedAt").value = updatedAt;
  document.getElementById("total").value = total;
  document.getElementById("offer").value = offer;
}

function deleteUser(categoryName, productCount, isDeleted) {
  document.getElementById("deletecategoryName").value = categoryName;
  document.getElementById("productCount").value = productCount;

  let deleteButtontext = "";
  let warningText = "";
  let staticBackdropLabel = "";

  if (isDeleted == "true") {
    staticBackdropLabel = " Restore Category ";
    warningText = `<h6 class="lh-lg">Are you sure you want to restore category "${categoryName}" </h6>`;
    deleteButtontext = " Restore ";
  } else {
    staticBackdropLabel = " Delete Category ";
    warningText = `<h6 class="lh-lg">Are you sure you want to delete category "${categoryName}" </h6>`;
    deleteButtontext = "Delete";
  }
  document.getElementById("deleteHed").innerHTML = staticBackdropLabel;
  document.getElementById("warningText").innerHTML = warningText;
  document.getElementById("deleteButtontext").innerText = deleteButtontext;
}

window.onload = function () {
  const [nav] = performance.getEntriesByType("navigation");

  if (nav && nav.type === "reload") {
    console.log("Page was manually refreshed.");
  } else {
    const warning = document.getElementById("warning").innerText;
    if (warning) {
      Swal.fire({
        title: "Success!",
        text: warning,
        icon: "success",
        confirmButtonText: "OK",
      });
    }

    const info = document.getElementById("info").innerText;
    if (info) {
      Swal.fire({
        title: "SORRY!",
        text: info,
        icon: "info",
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
};

const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
const appendAlert = function (message, type) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <a href="/admin/category"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></a>',
    "</div>",
  ].join("");
  alertPlaceholder.append(wrapper);
};
