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

async function generateInvoice() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let invoice = JSON.parse(document.getElementById("invoiceData").value);

  const fontUrl = "/font/NotoSans.ttf";
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

  function arrayBufferToBase64(buffer) {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  const fontBase64 = arrayBufferToBase64(fontData);

  doc.addFileToVFS("custom.ttf", fontBase64);
  doc.addFont("custom.ttf", "CustomFont", "normal");

  doc.setFont("CustomFont", "normal");

  const date = new Date();
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;

  const invoiceData = {
    shopName: "SML BAZAAR",
    shopLogo: "https://i.ibb.co/Pz42nTy9/output-onlinetools.png",
    contact: "+91 984613495 | shamilk3000@gmail.com",
    deliveryAddress: `${invoice.address.firstName} ${invoice.address.lastName}, ${invoice.address.address}, ${invoice.address.area}, ${invoice.address.pincode}, ${invoice.address.city}, ${invoice.address.state}`,
    orderId: invoice.order_id,
    date: formattedDate,
    items: invoice.items,
    deliveryCharge: invoice.deliveryCharge,
  };

  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = invoiceData.shopLogo;

  img.onload = function () {
    doc.addImage(img, "PNG", 10, 10, 30, 30);
    finalizePDF(doc, invoiceData);
  };

  img.onerror = function () {
    console.error("Failed to load image. Generating PDF without logo.");
    finalizePDF(doc, invoiceData);
  };
}

function finalizePDF(doc, invoiceData) {
  const today = new Date();
  const formattedDateInvoice = today.toISOString().split("T")[0];

  doc.setFontSize(18);
  doc.text(invoiceData.shopName, 50, 20);

  doc.setFontSize(10);
  doc.text(invoiceData.contact, 50, 30);

  doc.setFontSize(12);
  doc.text(`Order ID: ${invoiceData.orderId}`, 10, 50);
  doc.text(`Date: ${invoiceData.date}`, 10, 60);

  doc.text("Delivery Address:", 10, 70);
  doc.text(invoiceData.deliveryAddress, 10, 78, { maxWidth: 180 });

  doc.text("Items", 10, 100);
  doc.text("Qty", 90, 100);
  doc.text("Price", 120, 100);
  doc.text("Total", 160, 100);
  doc.line(10, 105, 200, 105);

  let y = 110;
  let total = 0;
  invoiceData.items.forEach((item) => {
    let itemTotal = item.quantity * item.offerPrice;
    total += itemTotal;
    doc.text(item.name, 10, y);
    doc.text(item.quantity.toString(), 90, y);
    doc.text(`₹${item.offerPrice.toString()}`, 120, y);
    doc.text(`₹${itemTotal.toString()}`, 160, y);
    y += 10;
  });

  doc.line(10, y, 200, y);
  doc.text("Delivery Charge:", 120, y + 10);
  doc.text(`₹${invoiceData.deliveryCharge.toString()}`, 160, y + 10);
  total += invoiceData.deliveryCharge;

  doc.line(10, y + 15, 200, y + 15);
  doc.setFontSize(14);
  doc.text("Grand Total:", 120, y + 25);
  doc.text(`₹${total}`, 160, y + 25);

  doc.save(`invoice_${formattedDateInvoice}.pdf`);
}

window.onload = function () {
  let invoice = JSON.parse(document.getElementById("invoiceData").value);
};
