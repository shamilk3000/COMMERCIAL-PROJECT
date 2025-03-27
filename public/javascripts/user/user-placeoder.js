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

let address = "";

window.onload = async function () {
  try {
    const response = await fetch("/api/placeOderAdrs", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // body: JSON.stringify({ productId : id }),
    });
    const data = await response.json();
    address = data.address;
    
  } catch (error) {
    console.error("Error fetching address:", error);
  }
  if (address.length == 0) {
    document.querySelectorAll(".toHide").forEach((element) => {
      element.style.display = "none";
    });
  } else {
    address.forEach((item, i) => {
      document.getElementById("selectAdrs").innerHTML += `
        <div class="form-check col-md-4 mb-2 p-1 border border-black rounded-3 me-0 position-relative">
    <input class="form-check-input position-absolute mt-1 ms-1 groupCheckbox" 
           type="checkbox" 
           id="option${i + 1}" 
           name="option" 
           value="${i + 1}">
    <label class="form-check-label ms-4" for="option${i + 1}">
        ${item.firstName} ${item.lastName}, ${item.address}, ${item.area}, 
        ${item.pincode}, ${item.city}, ${item.state}
    </label>
</div>
        `;
    });
  }

  check();
  deliveryCheck();
};

function check() {
  let total = document.getElementById("total").innerText;
  let bal = document.getElementById("balence").innerText;
  total = Number(total);
  bal = Number(bal);
  if (total > bal) {
    document.getElementById("showWallet").hidden = true;
  } else {
    document.getElementById("showWallet").hidden = false;
  }
  if (total > 1000) {
    document.getElementById("showCOD").hidden = true;
  } else {
    document.getElementById("showCOD").hidden = false;
  }
}
function deliveryCheck(){
  let total = document.getElementById("total").innerText;
  let bal = document.getElementById("balence").innerText;
  total = Number(total);
  if(total < 1000){
    document.getElementById("showDel").style.display = "flex";
    document.getElementById("total").innerText = total + 100
    document.getElementById("deliveryCharge").value = "true"
  }else{
    document.getElementById("showDel").style.display = "none";
  }
}


document.getElementById("selectAdrs").addEventListener("change", function (e) {
  if (e.target.classList.contains("groupCheckbox")) {
    document
      .querySelectorAll(".groupCheckbox")
      .forEach((cb) => (cb.checked = false));
    e.target.checked = true;

    let selectedID = parseInt(e.target.id.replace("option", "")) - 1;
    let addressData = address[selectedID];

    document.getElementById("firstName").value = addressData.firstName;
    document.getElementById("lastName").value = addressData.lastName;
    document.getElementById("email").value = addressData.email;
    document.getElementById("mobile").value = addressData.mobile;
    document.getElementById("pincode").value = addressData.pincode;
    document.getElementById("address").value = addressData.address;
    document.getElementById("area").value = addressData.area;
    document.getElementById("landmark").value = addressData.landmark;
    document.getElementById("city").value = addressData.city;
    document.getElementById("state").value = addressData.state;
  }
});

let paymentType = "";
document.addEventListener("DOMContentLoaded", function () {
  const paymentMethods = document.querySelectorAll('input[name="payment"]');
  // Listen for changes
  paymentMethods.forEach((input) => {
    input.addEventListener("change", () => {
      const selectedPayment = document.querySelector(
        'input[name="payment"]:checked'
      );
      if (selectedPayment) {
        paymentType = selectedPayment.value;
      }
    });
  });
});

async function applyCoupon() {
  let couponCode = document.getElementById("couponCode").value.trim();
    try {
      const response = await fetch("/api/applyCoupon", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode }),
      });
      const data = await response.json();
      if (data.messege.length != 0 && !data.apply) {
        Swal.fire({
          title: "SORRY!",
          text: data.messege,
          icon: "info",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Success!",
          text: "Coupon applied successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        document.getElementById("applyButton").innerText = "Remove Coupon";
        document.getElementById("applyButton").onclick = removeCoupon;
        let total = document.getElementById("total").innerText.trim();
        total = Number(total) - Number(data.couponDB.discountValue);
        document.getElementById("total").innerText = total;
        document.getElementById("couponH").innerText = "Coupon discount";
        document.getElementById(
          "couponD"
        ).innerText = `- ₹${data.couponDB.discountValue}`;
        document.getElementById("applyed").value = true;
        document.getElementById("totalAmount").value = total;
        check();
      }
    } catch (error) {
      console.error("Error fetching coupon:", error);
    }
}
let oderid = ""
document
  .getElementById("placeOderSub")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); 

    document.getElementById("payment").value = paymentType;
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
      return;
    } else if (!emailPattern.test(email)) {
      Swal.fire({
        title: "SORRY!",
        text: "Please enter a valid email address.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    } else if (paymentType == "") {
      Swal.fire({
        title: "SORRY!",
        text: "Please select a payment method.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    } else if (!mobilePattern.test(mobile)) {
      Swal.fire({
        title: "SORRY!",
        text: "Please enter a valid 10-digit phone number.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    } else if (!pincodePattern.test(pincode)) {
      Swal.fire({
        title: "SORRY!",
        text: "Please enter a valid 6-digit pincode.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    } else if (paymentType == "upi") {
      try {
        let total = document.getElementById("totalAmount").value;
        let deliveryCharge = document.getElementById("deliveryCharge").value;
        if(deliveryCharge == "true"){
          total = Number(total)+100
        }
        const response = await fetch("/api/razorpayapi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            total,
          }),
        });

        const data = await response.json();
        oderid =  data.orderId
        if (!data.success) {
          Swal.fire({
            title: "SORRY!",
            text: "Error creating order!",
            icon: "info",
            confirmButtonText: "OK",
          });
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "SML Bazaar",
          description: "Test Transaction",
          order_id: data.orderId,
          handler: async function (response) {
            try {
              const verifyResponse = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });

              const verifyData = await verifyResponse.json();
              if (verifyData.success) {
                document.getElementById("paymentDetails").value =
                  JSON.stringify(verifyData.paymentDetails);
                Swal.fire({
                  title: "Success!",
                  text: "Payment Successful!",
                  icon: "success",
                  confirmButtonText: "OK",
                }).then((result) => {
                  if (result.isConfirmed) {
                    document.getElementById("oderid").value =  oderid;
                    document.getElementById("placeOderSub").submit();
                  }
                });
              } else {
                paymentFail()
                Swal.fire({
                  title: "SORRY!",
                  text: "Payment Verification Failed!",
                  icon: "info",
                  confirmButtonText: "OK",
                });
              }
            } catch (error) {
              paymentFail()
              Swal.fire({
                title: "SORRY!",
                text: "Payment Verification Failed!",
                icon: "info",
                confirmButtonText: "OK",
              });
            }
          },
          prefill: {
            name: firstName + " " + lastName,
            email: email,
            contact: mobile,
          },
          theme: { color: "#69ee44" },
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();

        function paymentFail(){
          var paymentFailedModal = new bootstrap.Modal(document.getElementById("paymentFailedModal"));
          paymentFailedModal.show();
        }

        rzp1.on("payment.failed", function () {
          var paymentFailedModal = new bootstrap.Modal(document.getElementById("paymentFailedModal"));
          paymentFailedModal.show();
        });
      
        rzp1.on("modal.closed", function () {
          var paymentFailedModal = new bootstrap.Modal(document.getElementById("paymentFailedModal"));
          paymentFailedModal.show();
        });

        document.getElementById("pay-again-btn").onclick = function () {
          rzp1.open();
          var paymentFailedModal = document.getElementById("paymentFailedModal");
          var modalInstance = bootstrap.Modal.getInstance(paymentFailedModal);
          if (modalInstance) {
              modalInstance.hide(); 
          }
        };
      } catch (error) {
        Swal.fire({
          title: "SORRY!",
          text: "Payment Failed",
          icon: "info",
          confirmButtonText: "OK",
        });
      }
    } else {
      document.getElementById("oderid").value =  oderid;
      document.getElementById("placeOderSub").submit();
    }
  });

  async function removeCoupon() {
    let couponCode = document.getElementById("couponCode").value.trim();
      try {
        const response = await fetch("/api/removeCoupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ couponCode }),
        });
        const data = await response.json();
        if (data.messege.length != 0 && !data.apply) {
          Swal.fire({
            title: "SORRY!",
            text: data.messege,
            icon: "info",
            confirmButtonText: "OK",
          });
        } else {
          Swal.fire({
            title: "Success!",
            text: "Coupon removed successfully",
            icon: "success",
            confirmButtonText: "OK",
          });
          document.getElementById("applyButton").innerText = "Apply Coupon";
          document.getElementById("applyButton").onclick = applyCoupon;
          let total = document.getElementById("total").innerText.trim();
          total = Number(total) + Number(data.couponDB.discountValue);
          document.getElementById("total").innerText = total;
          document.getElementById("couponH").innerText = "";
          document.getElementById(
            "couponD"
          ).innerText = "";
          document.getElementById("applyed").value = false;
          document.getElementById("totalAmount").value = total;
          check();
        }
      } catch (error) {
        console.error("Error fetching coupon:", error);
      }
  }
