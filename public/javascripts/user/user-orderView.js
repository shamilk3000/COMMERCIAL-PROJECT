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

async function cancel(id) {
  try {
    console.log(id);
    const response = await fetch("/api/cancelOder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (data.cancel == true) {
      location.reload();
    }
  } catch (error) {
    console.error("Error cancel order:", error);
  }
}

async function returnOdr(id) {
  try {
    console.log(id);
    const response = await fetch("/api/returnOder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (data.cancel == true) {
      location.reload();
    }
  } catch (error) {
    console.error("Error return order:", error);
  }
}