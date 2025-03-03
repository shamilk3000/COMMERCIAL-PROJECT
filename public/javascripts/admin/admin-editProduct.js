const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("productImage");
const viewImagesBtn = document.getElementById("viewImagesBtn");
const modalImageContainer = document.getElementById("modalImageContainer");
const fileCountLabel = document.getElementById("fileCountLabel");

// upload image file add cheyyaanulla array

let uploadedImages = [];

// sizes add cheyyaanulla array

let selectedSizes = [];

let colourDBarr = [];

// size text

let buttonText = "";

window.onload = function () {
  // editproduct existing images show cheyyaan

  const productImageDB = document.getElementById("productImageDB").value;
  const imageDatas = productImageDB.split(/<split>,|<split>/);
  imageDatas.pop();

  const arr = imageDatas.map((data) => {
    const dataTemp = data.split(/data:|;base64,/);
    dataTemp.shift();
    return dataTemp;
  });

  function productImageconvertedDB(arr) {
    const imageBlobs = arr.map((imageArray) => {
      const mimeType = imageArray[0];
      const base64Data = imageArray[1];

      // Decode base64 string to binary data
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Create a Blob from the binary data
      return new Blob([byteArray], { type: mimeType });
    });
    return imageBlobs;
  }

  const convertedExistimage = productImageconvertedDB(arr);
  console.log(convertedExistimage);
  handleFiles(convertedExistimage);

  // Initialize color data when the page loads (if there is any pre-selected color data)

  let colors = [];
  let selectedColors = [];

  colourDBarr = document.getElementById("colourDBid").value;
  if (colourDBarr) {
    const clr = colourDBarr
      .split(",")
      .reduce((acc, curr, index, originalArray) => {
        if (index % 2 === 0) {
          acc.push([curr, parseInt(originalArray[index + 1])]);
        }
        return acc;
      }, []);

    clr.forEach(([key, value]) => {
      const existing = colors.find((item) => item[0] === key);
      if (existing) {
        existing[1] += value; // Add value to existing color
        updateDropdownItem(key, existing[1]); // Update dropdown item
      } else {
        colors.push([key, value]); // Add new color to array
        addNewColorToDropdown(key, value); // Add new color to dropdown
      }
    });
  }
  // Update the button text when the page is loaded
  saveSelectedColors();
  updateColorButtonText();

  // Event listener for adding new colors
  $("#addColorBtn").click(function () {
    const newColors = $("#newColor").val().trim();
    if (newColors) {
      // Parse and process the input colors
      const colorArray = newColors
        .split(",") // Split by comma
        .filter((item) => item.includes("-")) // Filter valid colors with '-' (key-value)
        .map((item) => {
          const [key, value] = item.split("-");
          if (!key || isNaN(value)) return null;
          return [key.trim(), parseInt(value)]; // Map to [key, value]
        })
        .filter(Boolean) // Remove invalid entries
        .reduce((acc, [key, value]) => {
          const existing = acc.find((item) => item[0] === key);
          if (existing) {
            existing[1] += value; // Add value to existing key
          } else {
            acc.push([key, value]); // Add new key-value pair
          }
          return acc;
        }, []);

      // Check for existing keys and add values if necessary
      colorArray.forEach(([key, value]) => {
        const existing = colors.find((item) => item[0] === key);
        if (existing) {
          existing[1] += value; // Add value to existing color
          updateDropdownItem(key, existing[1]); // Update dropdown item
        } else {
          colors.push([key, value]); // Add new color to array
          addNewColorToDropdown(key, value); // Add new color to dropdown
        }
      });

      // Clear the input field after adding colors
      $("#newColor").val("");
      saveSelectedColors(); // Save selected colors after adding new ones
      updateColorButtonText();
    } else {
      Swal.fire({
        title: "SORRY!",
        text: "Please enter valid color names!",
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  });

  // Event listener for checkbox selection/deselection
  $(document).on("change", "#colorDropdown .form-check-input", function () {
    if (!$(this).prop("checked")) {
      $(this).parent().remove();
      const keyToRemove = $(this).parent().text().trim().split("-")[0];
      colors.splice(
        colors.findIndex(([key]) => key === keyToRemove),
        1
      ); // Remove color from array
    }
    saveSelectedColors(); // Save selected colors whenever checkbox is checked/unchecked
    updateColorButtonText();
  });

  // Update the button text with the number of selected colors
  function updateColorButtonText() {
    const selectedCount = $("#colorDropdown .form-check-input:checked").length;
    if (selectedCount > 0) {
      $("#dropdownButtonText").text(`${selectedCount} Colors Selected`);
    } else {
      $("#dropdownButtonText").text("Select Colors");
    }
  }

  // Save selected colors to the hidden input field
  function saveSelectedColors() {
    const dummy = [];
    selectedColors = [];

    $("#colorDropdown .form-check-input:checked").each(function () {
      let colorFull = $(this).parent().text().trim().split("-");
      dummy.push(colorFull); // Add the color key-value pair
    });
    const collersForSave = dummy.reduce((acc, [key, value]) => {
      const existing = acc.find((item) => item[0] === key);
      if (existing) {
        existing[1] += parseInt(value);
      } else {
        acc.push([key, parseInt(value)]);
      }
      return acc;
    }, []);
    collersForSave.forEach(([key, value]) => {
      selectedColors.push([key, value]);
    });
    $("#colorInput").val(JSON.stringify(selectedColors)); // Store selected colors in hidden input field
    var totalValue = colors.reduce((sum, [key, value]) => {
      return sum + Number(value); // Convert value to a number before adding
    }, 0);
    if (totalValue === 0 || totalValue === "") {
      totalValue = 0;
    }
    document.getElementById("quantityValue").value = totalValue;
  }

  function updateDropdownItem(key, value) {
    $(`#colorDropdown li:contains('${key}-') span.color-text`).text(
      `${key}-${value}`
    );
  }

  function addNewColorToDropdown(key, value) {
    const li = $('<li class="dropdown-item d-flex align-items-center"></li>');
    const checkbox = $(
      '<input type="checkbox" class="form-check-input me-2" checked />'
    );
    const text = $('<span class="color-text"></span>').text(`${key}-${value}`);
    li.append(checkbox).append(text);
    $("#colorDropdown").append(li);
  }

  // already existing product warning

  const [nav] = performance.getEntriesByType("navigation");

  if (nav && nav.type === "reload") {
    console.log("Page was manually refreshed.");
  } else {
    const warning = document.getElementById("warning").innerText;
    if (warning) {
      Swal.fire({
        title: "SORRY!",
        text: warning,
        icon: "info",
        confirmButtonText: "OK",
      });
    }

    console.log("Page loaded for the first time.");
  }
};

// Prevent default drag behaviors

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => e.preventDefault(), false);
});

// dropzonil mouse hover aayaal colour change cheyyaan

dropZone.addEventListener("dragover", () => {
  dropZone.classList.replace("bg-danger-subtle", "bg-danger");
});

// dropzonil mouse drope cheythaal colour change cheyyaan

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.replace("bg-danger", "bg-danger-subtle");
});

// dropzonil upload file drop cheythaal handlefiles call cheyyaan

dropZone.addEventListener("drop", (e) => {
  dropZone.classList.replace("bg-danger", "bg-primary-subtle");
  const files = Array.from(e.dataTransfer.files); // Get the files
  if (files.length > 0) {
    handleFiles(files);
  }
});

// upload inputil file add aayaal handlefiles call cheyyaan

fileInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    // orginal
    handleFiles(files);
  }
});

function cropImagesToAspectRatio() {
  console.log(
    "Before aspect:",
    uploadedImages.map((img, i) => ({
      id: img.id,
      index: i,
      name: img.file.name,
    }))
  );
  // To store the cropped images
  let croppedImages = [];

  uploadedImages.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileType = file.file.type;
      console.log(fileType);
      // Check the file type to decide how to handle it
      if (fileType.startsWith("image/")) {
        // Handle image files (e.g., jpg, png, gif, etc.)
        const img = new Image();
        img.onload = function () {
          const targetWidth = 280;
          const targetHeight = 350;
          const aspectRatio = targetWidth / targetHeight;

          // High resolution (2x the target size) for better quality
          const highQualityWidth = targetWidth * 2;
          const highQualityHeight = targetHeight * 2;

          let cropWidth = img.width;
          let cropHeight = img.height;

          if (img.width / img.height > aspectRatio) {
            cropWidth = img.height * aspectRatio;
          } else {
            cropHeight = img.width / aspectRatio;
          }

          const offsetX = (img.width - cropWidth) / 2;
          const offsetY = 0; // Center cropping vertically (if needed)
          // Create a canvas for high-resolution cropping
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas size to high-quality resolution
          canvas.width = highQualityWidth;
          canvas.height = highQualityHeight;

          // Draw the cropped image onto the canvas at high resolution
          ctx.drawImage(
            img,
            offsetX,
            offsetY,
            cropWidth,
            cropHeight,
            0,
            0,
            highQualityWidth,
            highQualityHeight
          );

          // Convert the cropped image into a Blob
          canvas.toBlob(function (blob) {
            // Create a new File object from the Blob
            const croppedImageFile = new File([blob], file.name, {
              type: file.type,
            });

            // Store the cropped image file in the croppedImages array
            croppedImages.push(croppedImageFile);

            // After all files are processed, update the uploadedImages array with cropped images
            if (croppedImages.length === uploadedImages.length) {
              uploadedImages = croppedImages;
              addId(); // Store only the cropped images
            }
          }, file.type);
        };

        img.src = e.target.result;
      } else {
        // If the file is not an image, just skip it (or handle accordingly)
        console.log("Skipping non-image file:", file);
        if (croppedImages.length === uploadedImages.length) {
          uploadedImages = croppedImages; // Store only the cropped images
        }
      }
    };

    reader.readAsDataURL(file.file); // Start reading the file
  });
  console.log(
    "after aspect:",
    uploadedImages.map((img, i) => ({
      id: img.id,
      index: i,
      name: img.filename,
    }))
  );
}

fileInput.addEventListener("change", function (event) {
  if (uploadedImages.length != 0 && fileInput.files.length == 0) {
    uploading([]);
    uploading(uploadedImages);
  }
});

//save upload images to hidden input

function uploading(allFiles) {
  if (allFiles.length === 0) {
    console.log("No images");
  } else {
    const dataTransfer = new DataTransfer();
    allFiles.forEach((file) => {
      if (file.file instanceof File) {
        dataTransfer.items.add(file.file);
      } else if (file.file instanceof Blob) {
        const newFile = new File([file.file], file.file.type, {
          type: file.file.type,
        });
        dataTransfer.items.add(newFile);
      }
    });

    document.getElementById("productImage").files = dataTransfer.files;
  }
}

document.getElementById("form").addEventListener("submit", function (event) {
  const filesTotal = document.getElementById("productImage").files;
  if (filesTotal.length < 3) {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Please upload at least 3 images.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else {
    uploading(uploadedImages);
  }
});

function handleFiles(files) {
  const newFiles = Array.from(files);
  const promises = newFiles.map((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          resolve(file);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  Promise.all(promises).then((processedFiles) => {
    addId(processedFiles);
    uploadedImages = [...uploadedImages, ...processedFiles];
    updateModalImages();
    updateFileCount();
    viewImagesBtn.style.display = "inline-block";
    dropZone.classList.replace("bg-danger-subtle", "bg-primary-subtle");
    uploading(uploadedImages);
    console.log(
      "after upload:",
      uploadedImages.map((img, i) => ({
        id: img.id,
        index: i,
        name: img.file.name,
      }))
    );
  });
}

function addId(files) {
  let n = uploadedImages.length;
  console.log(files);
  files.forEach((file, index) => {
    files[index] = { id: index + n, file };
  });
}

// Update modal with uploaded image previews

let cropper; // Declare cropper globally
let isCropping = false; // Flag to prevent multiple cropping actions

function crop(id) {
  if (isCropping) return; // Prevent cropping while another image is being cropped
  isCropping = true; // Set the flag to indicate cropping is in progress

  const file = uploadedImages.find((image) => image.id === id); // Find the image by ID
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgElement = document.getElementById("imagePreview");
      imgElement.src = e.target.result;

      imgElement.onload = function () {
        // Destroy previous cropper instance if it exists
        if (cropper) {
          cropper.destroy();
        }

        // Initialize a new cropper instance
        cropper = new Cropper(imgElement, {
          aspectRatio: 0.8, // Set the aspect ratio
          viewMode: 2, // Restrict the crop box within image
          autoCropArea: 0.8, // Initial crop box size
          responsive: true, // Make it responsive
        });

        const cropButton = document.getElementById("cropButton");

        // Define the crop action handler
        const cropImageHandler = function () {
          const croppedCanvas = cropper.getCroppedCanvas();

          // Convert the cropped image to a File object
          croppedCanvas.toBlob(function (blob) {
            const croppedImageFile = new File([blob], file.file.name, {
              type: file.file.type,
            });
            console.log("triggered crop");
            // Find the index of the image being cropped
            const imageIndex = uploadedImages.findIndex(
              (image) => image.id === id
            );
            if (imageIndex !== -1) {
              // Replace the old image with the new cropped image
              uploadedImages[imageIndex] = { id: id, file: croppedImageFile };

              // After updating the image, update the modal and reset the cropping flag
              uploading(uploadedImages);
              updateModalImages(); // Ensure modal gets updated after cropping
              isCropping = false; // Reset flag after cropping is complete
            }

            // Reset the preview and close the crop modal
            document.getElementById(
              "cropmodalImage"
            ).innerHTML = `<div class="col-10"><img id="imagePreview" style="max-width: 100%;" /></div>`;

            // Close the crop modal
            const cropimageModalElement =
              document.getElementById("cropimageModal");
            const cropimageModal = bootstrap.Modal.getInstance(
              cropimageModalElement
            );
            cropimageModal.hide();
          }, file.file.type);
        };

        // Add event listener for the crop button
        cropButton.addEventListener("click", cropImageHandler);

        // Remove the event listener after the crop is completed
        document
          .getElementById("cropimageModal")
          .addEventListener("hidden.bs.modal", function () {
            cropButton.removeEventListener("click", cropImageHandler);
          });
      };
    };
    reader.readAsDataURL(file.file); // Start reading the file as DataURL
  }
}

function updateModalImages() {
  console.log("Updating modal images...");

  // Clear the modal images container
  modalImageContainer.innerHTML = ""; // Clear any old images

  // Loop through uploaded images and display them
  uploadedImages.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxWidth = img.width;
        const maxHeight = img.height;
        let width = img.width;
        let height = img.height;

        // Resize image logic
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Create the modal image card
        const col = document.createElement("div");
        col.className = "col-3"; // Ensure images are arranged in a 3-column grid
        col.innerHTML = `
          <div class="card">
            <img src="${canvas.toDataURL()}" class="card-img-top" alt="Image ${
          file.id
        }">
            <button class="btn btn-warning btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#cropimageModal" onclick="crop(${
              file.id
            })">Crop</button>
            <button class="btn btn-danger btn-sm mt-2" onclick="deleteImage(${
              file.id
            })">Delete</button>
          </div>
        `;

        modalImageContainer.appendChild(col);
      };
    };

    reader.readAsDataURL(file.file); // Read image file
  });
}

// Update the upload image count label

function updateFileCount() {
  const fileCount = uploadedImages.length;

  if (fileCount !== 0) {
    fileCountLabel.textContent = `You have ${fileCount} file${
      fileCount !== 1 ? "s" : ""
    } selected.`;
  } else {
    fileCountLabel.textContent = `Drag and drop images here, or click to upload`;
  }
}

// Delete an image

function deleteImage(id) {
  const indexToRemove = uploadedImages.findIndex((image) => image.id === id);
  if (indexToRemove !== -1) {
    uploadedImages.splice(indexToRemove, 1);
    console.log(`Image with id ${id} removed.`);
  } else {
    console.log(`Image with id ${id} not found.`);
  } // Remove image from array
  updateFileCount(); // Update the file count label
  uploading(uploadedImages);
  updateModalImages(); // Update modal content
  if (uploadedImages.length === 0) {
    // If no images are left
    viewImagesBtn.style.display = "none"; // Hide the view button
    dropZone.classList.replace("bg-primary-subtle", "bg-danger-subtle"); // Reset background color

    // Close the modal if all images are deleted
    const imageModal = bootstrap.Modal.getInstance(
      document.getElementById("imageModal")
    );
    if (imageModal) {
      imageModal.hide();
    }
  }
}

// Show modal on button click

viewImagesBtn.addEventListener("click", () => {
  event.preventDefault();
  const imageModal = new bootstrap.Modal(
    document.getElementById("imageModal"),
    {
      keyboard: true,
    }
  );
  imageModal.show();
});

// size button text update and inputil save cheyyaan

// document
//   .querySelectorAll("#sizeDropdownBox .dropdown-item input")
//   .forEach(function (checkbox) {
//     checkbox.addEventListener("change", function () {
//       selectedSizes = [];
//       buttonText = [];
//       document
//         .querySelectorAll("#sizeDropdownBox .dropdown-item input:checked")
//         .forEach(function (checkedBox) {
//           selectedSizes.push(checkedBox.value);
//         });

//       // selectedSizes = [...new Set(selectedSizes)];
//       buttonText =
//         selectedSizes.length > 0 ? selectedSizes.join(", ") : "Select Size";
//       document.getElementById("sizeDropdownText").innerText = buttonText;

//       document.getElementById("sizeInput").value =
//         JSON.stringify(selectedSizes);
//     });
//   });

const input1 = document.getElementById("offer");
const input2 = document.getElementById("offerPrice");
const input3 = document.getElementById("price");

input1.addEventListener("input", (event) => {
  const offer = parseFloat(input1.value);
  const price = parseFloat(input3.value);
  const offerPrice = price - (price * offer) / 100;
  input2.value = Math.round(offerPrice);
});

input2.addEventListener("input", (event) => {
  const offerPrice = parseFloat(input2.value);
  const price = parseFloat(input3.value);
  const offer = ((price - offerPrice) / price) * 100;
  input1.value = Math.round(offer);
});

input3.addEventListener("input", (event) => {
  const price = parseFloat(input3.value);
  const offerPrice = parseFloat(input2.value);
  const offer = parseFloat(input1.value);

  if (!isNaN(offer)) {
    const calculatedOfferPrice = price - (price * offer) / 100;
    input2.value = Math.round(calculatedOfferPrice);
  } else if (!isNaN(offerPrice)) {
    const calculatedOffer = ((price - offerPrice) / price) * 100;
    input1.value = Math.round(calculatedOffer);
  }
});

input1.addEventListener("blur", function () {
  if (input1.value.trim() === "") {
    input1.value = 0;
  }
});

input2.addEventListener("blur", function () {
  if (this.value.trim() === "") {
    input2.value = input3.value || 0;
  }
});

function validateForm() {
  // Get form elements
  const productName = document.getElementById("productName");
  const brand = document.getElementById("brand");
  const price = document.getElementById("price");
  const quantity = document.querySelector('input[name="quantity"]');
  const description = document.getElementById("description");
  const productImage = document.getElementById("productImage");
  const category = document.getElementById("category").value;
  const colour = document.getElementById("colorInput").value;
  const size = document.getElementById("sizeInput").value;
  // Initialize an array to collect error messages
  const offerInput = document.getElementById("offer");
  const offerPrice = document.getElementById("offerPrice");

  // Set initial value to 0 if empty
  if (offerInput.value.trim() === "") {
    offerInput.value = 0;
  }
  if (offerPrice.value.trim() === "" && offerInput.value.trim() == 0) {
    offerPrice.value = price.value;
  }
  if (productName.value.trim() === "") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Product name is required.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (category == "Select") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Please select a category",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (brand.value.trim() === "") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Brand is required",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (size == "Select Size") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Please select size",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (
    price.value.trim() === "" ||
    isNaN(price.value) ||
    Number(price.value) <= 0
  ) {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "A valid price is required.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (colour.trim() == "[]") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Please enter a colour.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (quantity.value.trim() === "" || isNaN(quantity.value)) {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "A valid quantity is required.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (description.value.trim() === "") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Description is required.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (productImage.files.length === 2) {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "At least three product image is required.",
      icon: "info",
      confirmButtonText: "OK",
    });
  }
}

// Attach the validate function to the form's submit event
document.getElementById("form").addEventListener("submit", function (event) {
  validateForm(event);
});
