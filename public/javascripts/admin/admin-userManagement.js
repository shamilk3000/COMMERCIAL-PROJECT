function view(
  firstName,
  lastName,
  username,
  email,
  phoneNumber,
  status,
  createdAt,
  updatedAt,
  updatedBy
) {
  if (status == "true") {
    status = "Active";
  } else {
    status = "Blocked";
  }
  const name = firstName + " " + lastName;
  document.getElementById("viewname").value = name;
  document.getElementById("viewusername").value = username;
  document.getElementById("viewemail").value = email;
  document.getElementById("viewphoneNumber").value = phoneNumber;
  document.getElementById("viewstatus").value = status;
  document.getElementById("viewcreatedAt").value = createdAt;
  document.getElementById("viewupdatedBy").value = updatedBy;
  document.getElementById("viewupdatedAt").value = updatedAt;
}

function deleteUser(username, email) {
  document.getElementById("deleteEmail").value = email;
  document.getElementById("deleteUsernamePost").value = username;
  document.getElementById("deleteUsername").innerHTML =
    "<strong> " + username + "</strong>";
}

window.onload = function () {
  const [nav] = performance.getEntriesByType("navigation");

  if (nav && nav.type === "reload") {
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
  }

  const type = document.getElementById("type").innerText;
  const searchresult = document.getElementById("searchresult").innerText;
  if (searchresult) {
    appendAlert(searchresult, type);
  }

  const button = document.getElementById("button").innerText;
  const allBtn = document.getElementById("allBtn");
  const activeBtn = document.getElementById("activeBtn");
  const blockedBtn = document.getElementById("blockedBtn");

  allBtn.classList.replace("btn-danger", "btn-light");
  activeBtn.classList.replace("btn-danger", "btn-light");
  blockedBtn.classList.replace("btn-danger", "btn-light");

  if (button == "active") {
    activeBtn.classList.replace("btn-light", "btn-danger");
  } else if (button == "block") {
    blockedBtn.classList.replace("btn-light", "btn-danger");
  } else if (button != "active" && button != "block") {
    allBtn.classList.replace("btn-light", "btn-danger");
  }
};

const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
const appendAlert = function (message, type) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <a href="/admin/userManagement"><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></a>',
    "</div>",
  ].join("");
  alertPlaceholder.append(wrapper);
};
