window.onload = function () {
  const existCategory = document.getElementById("existCategory").innerText;
  if (existCategory) {
    document.getElementById("existCategoryW").innerText = existCategory;
  }
};
function validateForm() {
  const categoryName = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("description").value.trim();
  const offer = document.getElementById("offer").value.trim();

  if (!categoryName || !description || !offer) {
    Swal.fire({
      title: "Error!",
      text: "Category name , description and offer are required",
      icon: "error",
      confirmButtonText: "OK",
    });
    return false;
  }

  return true;
}
