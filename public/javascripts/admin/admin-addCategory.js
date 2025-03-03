// Client-side validation
function validateCategoryForm() {
  const categoryName = document.getElementById("categoryName").value.trim();
  const description = document.getElementById("description").value.trim();
  const offer = document.getElementById("offer").value.trim();

  if (!categoryName) {
    Swal.fire({
      title: "Error",
      text: "Category name is required",
      icon: "error",
    });
    return false;
  }

  if (!description) {
    Swal.fire({
      title: "Error",
      text: "Description is required",
      icon: "error",
    });
    return false;
  }

  if (!offer) {
    Swal.fire({
      title: "Error",
      text: "Offer is required",
      icon: "error",
    });
    return false;
  }

  return true;
}
