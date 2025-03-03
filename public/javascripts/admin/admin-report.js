document.addEventListener("DOMContentLoaded", function () {
  let datePickerContainer = document.getElementById("datePickerContainer");
  let dateRange = document.getElementById("dateRange");
  let customRadio = document.getElementById("custom");

  flatpickr(dateRange, {
    mode: "range",
    dateFormat: "Y-m-d",
    maxDate: "today",
  });

  document.querySelectorAll('input[name="filter"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      datePickerContainer.style.display = customRadio.checked
        ? "block"
        : "none";
    });
  });
});

async function downloadReport(format) {
  try {
    let sendData = document.getElementById("dwnld").value;
    sendData = JSON.parse(sendData);

    const jsonData = encodeURIComponent(JSON.stringify(sendData));

    const downloadUrl = `/admin/api/download?format=${format}&data=${jsonData}`;

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    Swal.fire({
      title: "Success!",
      text: "✅ Sales report download started!",
      icon: "success",
      confirmButtonText: "OK",
    });
  } catch (error) {
    Swal.fire({
      title: "Sorry!",
      text: "❌ Error while downloading report",
      icon: "error",
      confirmButtonText: "OK",
    });
    console.error("Error while downloading report:", error);
  }
}
