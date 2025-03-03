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

let addstart = false;
document
  .getElementById("addressForm")
  .addEventListener("submit", function (event) {
    // Prevent actual form submission

    let firstName = document.getElementById("firstName").value.trim();
    let lastName = document.getElementById("lastName").value.trim();
    let email = document.getElementById("email").value.trim();
    let mobile = document.getElementById("mobile").value.trim();
    let pincode = document.getElementById("pincode").value.trim();
    let address = document.getElementById("address").value.trim();
    let area = document.getElementById("area").value.trim();
    let landmark = document.getElementById("landmark").value.trim();
    let city = document.getElementById("city").value.trim();
    let state = document.getElementById("state").value.trim();
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let mobilePattern = /^[0-9]{10}$/;
    let pincodePattern = /^[0-9]{6}$/;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !pincode ||
      !address ||
      !area ||
      !landmark ||
      !city ||
      !state
    ) {
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
    } else if (!pincodePattern.test(pincode)) {
      Swal.fire({
        title: "SORRY!",
        text: "Please enter a valid 6-digit pincode.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else {
      addstart = true;
    }
  });

let editstart = false;
document
  .getElementById("editaddressForm")
  .addEventListener("submit", function (event) {
    // Prevent actual form submission

    let firstName = document.getElementById("editfirstName").value.trim();
    let lastName = document.getElementById("editlastName").value.trim();
    let email = document.getElementById("editemail").value.trim();
    let mobile = document.getElementById("editmobile").value.trim();
    let pincode = document.getElementById("editpincode").value.trim();
    let address = document.getElementById("editaddress").value.trim();
    let area = document.getElementById("editarea").value.trim();
    let landmark = document.getElementById("editlandmark").value.trim();
    let city = document.getElementById("editcity").value.trim();
    let state = document.getElementById("editstate").value.trim();
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let mobilePattern = /^[0-9]{10}$/;
    let pincodePattern = /^[0-9]{6}$/;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !pincode ||
      !address ||
      !area ||
      !landmark ||
      !city ||
      !state
    ) {
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
    } else if (!pincodePattern.test(pincode)) {
      Swal.fire({
        title: "SORRY!",
        text: "Please enter a valid 6-digit pincode.",
        icon: "info",
        confirmButtonText: "OK",
      });
      event.preventDefault();
    } else {
      editstart = true;
    }
  });

function edit(index, id) {
  console.log(index, id);
  let firstName = document.getElementById(`firstName${index}`).value;
  let lastName = document.getElementById(`lastName${index}`).value;
  let email = document.getElementById(`email${index}`).value;
  let mobile = document.getElementById(`mobile${index}`).value;
  let pincode = document.getElementById(`pincode${index}`).value;
  let address = document.getElementById(`addressdata${index}`).value;
  let area = document.getElementById(`area${index}`).value;
  let landmark = document.getElementById(`landmark${index}`).value;
  let city = document.getElementById(`city${index}`).value;
  let state = document.getElementById(`state${index}`).value;

  document.getElementById("editid").value = id;
  document.getElementById("editfirstName").value = firstName;
  document.getElementById("editlastName").value = lastName;
  document.getElementById("editemail").value = email;
  document.getElementById("editmobile").value = mobile;
  document.getElementById("editpincode").value = pincode;
  document.getElementById("editaddress").value = address;
  document.getElementById("editarea").value = area;
  document.getElementById("editlandmark").value = landmark;
  document.getElementById("editcity").value = city;
  document.getElementById("editstate").value = state;

  let updatedAddress = {
    firstName,
    lastName,
    email,
    mobile,
    pincode,
    address,
    area,
    landmark,
    city,
    state,
  };

  console.log("Updating Address: ", updatedAddress);
}

async function addAddress() {
  try {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let email = document.getElementById("email").value;
    let mobile = document.getElementById("mobile").value;
    let pincode = document.getElementById("pincode").value;
    let address = document.getElementById("address").value;
    let area = document.getElementById("area").value;
    let landmark = document.getElementById("landmark").value;
    let city = document.getElementById("city").value;
    let state = document.getElementById("state").value;
    if (addstart) {
      console.log("Adding Address");
      const response = await fetch("/api/addAddress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          mobile,
          pincode,
          address,
          area,
          landmark,
          city,
          state,
        }),
      });
      const data = await response.json();
      if (data.added == true) {
        location.reload();
      } else {
        Swal.fire({
          title: "Sorry!",
          text: "This address already exists",
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    }
  } catch (error) {
    console.error("Error adding address:", error);
  }
}

async function editAddressDB() {
  try {
    let id = document.getElementById("editid").value;
    let firstName = document.getElementById("editfirstName").value;
    let lastName = document.getElementById("editlastName").value;
    let email = document.getElementById("editemail").value;
    let mobile = document.getElementById("editmobile").value;
    let pincode = document.getElementById("editpincode").value;
    let address = document.getElementById("editaddress").value;
    let area = document.getElementById("editarea").value;
    let landmark = document.getElementById("editlandmark").value;
    let city = document.getElementById("editcity").value;
    let state = document.getElementById("editstate").value;

    if (editstart) {
      console.log("editing Address");
      const response = await fetch("/api/editAddress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          firstName,
          lastName,
          email,
          mobile,
          pincode,
          address,
          area,
          landmark,
          city,
          state,
        }),
      });
      const data = await response.json();
      if (data.edit == true) {
        location.reload();
      } else {
        Swal.fire({
          title: "Sorry!",
          text: "This address already exists",
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    }
  } catch (error) {
    console.error("Error editing address:", error);
  }
}

async function deleteAddress(id) {
  try {
    console.log("deleting Address");
    const response = await fetch("/api/deleteAddress", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (data.delete == true) {
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
    console.error("Error editing address:", error);
  }
}
