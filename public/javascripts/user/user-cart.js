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

let warn = false;
let limit = false;
function updateButtons(id) {
  const quantityInput = document.getElementById(id);
  const incButton = document.getElementById(`inc${id}`);
  const decButton = document.getElementById(`dec${id}`);
  let stock = parseInt(quantityInput.getAttribute("data-stock")) || 10;
  let minValue = parseInt(quantityInput.min) || 1;
  let maxValue = stock > 10 ? 10 : stock;
  incButton.disabled = parseInt(quantityInput.value) >= maxValue;
  decButton.disabled = parseInt(quantityInput.value) <= minValue;
}

function incButtonC(id) {
  const quantityInput = document.getElementById(id);

  let stock = parseInt(quantityInput.getAttribute("data-stock")) || 10;
  let minValue = parseInt(quantityInput.min) || 1;
  let maxValue = stock > 10 ? 10 : stock;
  let currentValue = parseInt(quantityInput.value);
  if (currentValue < maxValue) {
    quantityInput.value = currentValue + 1;

  } else {
    warn = true;
  }
  updateButtons(id);
  changed(id);
}

function decButtonC(id) {
  const quantityInput = document.getElementById(id);

  let stock = parseInt(quantityInput.getAttribute("data-stock")) || 10;
  let minValue = parseInt(quantityInput.min) || 1;
  let maxValue = stock > 10 ? 10 : stock;
  let currentValue = parseInt(quantityInput.value);
  if (currentValue > minValue) {
    quantityInput.value = currentValue - 1;
  } else {
    limit = true;
  }
  updateButtons(id);
  changed(id);
}

async function changed(id) {
  try {
    if (warn) {
      Swal.fire({
        title: "Sorry!",
        text: "Stock is not available",
        icon: "info",
        confirmButtonText: "OK",
      });
      warn = false;
    } else if (limit) {
      Swal.fire({
        title: "Sorry!",
        text: "A minimum quantity of 1 is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
      limit = false;
    } else {
      const quantityInput1 = parseInt(document.getElementById(id).value);
      const response = await fetch("/api/editCart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity: quantityInput1 }),
      });

      const data = await response.json();
      if (data.updated != true) {
        Swal.fire({
          title: "Sorry!",
          text: data.error,
          icon: "info",
          confirmButtonText: "OK",
        });
      } else {
        document.getElementById(id).value = data.quantity;
        document.getElementById(id+"total").innerHTML = `&#8377;${data.total}`;
        let total = document.getElementById("total").innerText;
        total = Number(total)-Number(data.minus)
        total = total + Number(data.total)
        document.getElementById("total").innerText = total;
      }
    }
  } catch (error) {
    console.error("Error adding cart item:", error);
  }
}

async function deleteCart(id) {
  try {
    const response = await fetch("/api/deleteCart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    const data = await response.json();
    if (data.deleted == true) {
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
    console.error("Error deleting cart item:", error);
  }
}

function outOfstock() {
  event.preventDefault();
  Swal.fire({
    title: "Sorry!",
    text: "Remove the out of stock items.",
    icon: "info",
    confirmButtonText: "OK",
  });
}
