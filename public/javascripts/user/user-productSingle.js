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

//-----------------------------------------------------------------------------------------------------------------------------
// window loadil photo onn maathram kaanikkaan
window.onload = function () {
  const stockText = document.getElementById("stock").value;
  const div = document.getElementById("div");
  document.getElementById("quantity").max = Number(stockText);
  if (stockText == 0) {
    document.getElementById("cart").disabled = true;
    document.getElementById("buyBtn").disabled = true;
    div.innerHTML = `<h5 class="text-danger mb-4" >Out of Stock</h5>`;
  } else {
    document.getElementById("cart").disabled = false;
    document.getElementById("buyBtn").disabled = false;
    div.innerHTML = `<label for="quantity" class="form-label">Stock Available</label>
            <div class="input-group ">
            <input type="number" id="stockText"  class="form-control text-center" value="${stockText}" readonly >
            </div>`;
  }

  document.querySelectorAll(".thumbnail").forEach((img, index) => {
    if (index !== 0) {
      img.classList.remove("thumbnail-active");
    }
  });
};

const mainImage = document.getElementById("mainImage");
const zoomLens = document.getElementById("zoomLens");
const zoomedImage = document.getElementById("zoomedImage");
let isZoomActive = false;

function updateZoom(e) {
  if (!isZoomActive) return;

  const containerRect = mainImage.getBoundingClientRect();
  const x = e.clientX - containerRect.left;
  const y = e.clientY - containerRect.top;

  // Lens position calculations
  const lensSize = 100;
  let lensX = x - lensSize / 2;
  let lensY = y - lensSize / 2;

  // Keep lens within image bounds
  lensX = Math.max(0, Math.min(lensX, containerRect.width - lensSize));
  lensY = Math.max(0, Math.min(lensY, containerRect.height - lensSize));

  // Update lens position
  zoomLens.style.display = "block";
  zoomLens.style.width = `${lensSize}px`;
  zoomLens.style.height = `${lensSize}px`;
  zoomLens.style.left = `${lensX}px`;
  zoomLens.style.top = `${lensY}px`;

  // Calculate zoomed image position
  const zoomLevel = 2;
  const bgX = (lensX / containerRect.width) * 100;
  const bgY = (lensY / containerRect.height) * 100;

  zoomedImage.style.backgroundImage = `url('${mainImage.dataset.zoomImage}')`;
  zoomedImage.style.backgroundPosition = `${bgX}% ${bgY}%`;
  zoomedImage.style.backgroundSize = `${containerRect.width * zoomLevel}px`;
}

mainImage.addEventListener("mousemove", updateZoom);
mainImage.addEventListener("mouseenter", () => {
  isZoomActive = true;
  zoomedImage.style.display = "block";
});
mainImage.addEventListener("mouseleave", () => {
  isZoomActive = false;
  zoomLens.style.display = "none";
  zoomedImage.style.display = "none";
});

function changeImage(thumbnail, mainImageUrl, zoomImageUrl) {
  // Update main image
  mainImage.src = mainImageUrl;
  mainImage.dataset.zoomImage = zoomImageUrl;

  // Update thumbnails active state
  document.querySelectorAll(".thumbnail").forEach((img) => {
    img.classList.remove("thumbnail-active");
  });
  thumbnail.classList.add("thumbnail-active");
}

const stars = document.querySelectorAll(".star-rating .star");
const ratingInput = document.getElementById("rating");

stars.forEach((star) => {
  star.addEventListener("click", () => {
    const value = star.getAttribute("data-value");
    ratingInput.value = value;

    // Update star colors
    stars.forEach((s) => {
      if (s.getAttribute("data-value") <= value) {
        s.classList.add("selected");
      } else {
        s.classList.remove("selected");
      }
    });
  });
});

document
  .getElementById("valReview")
  .addEventListener("submit", function (event) {
    let rating = document.getElementById("rating").value.trim();
    let review = document.getElementById("review").value.trim();

    if (rating == 0 || rating == "") {
      event.preventDefault();
      Swal.fire({
        title: "SORRY!",
        text: "Rating is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
    } else if (review.length == "") {
      event.preventDefault();
      Swal.fire({
        title: "SORRY!",
        text: "Review is required.",
        icon: "info",
        confirmButtonText: "OK",
      });
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  const moreReview = document.getElementById("moreReview");
  const lessReview = document.getElementById("lessReview");
  const reviewDiv = document.getElementById("reviewDiv");
  const lessReviewdiv = document.getElementById("lessReviewdiv");

  function showDiv(divToShow) {
    [reviewDiv, lessReviewdiv].forEach((div) => {
      div.style.display = "none";
    });
    divToShow.style.display = "block";
  }

  moreReview.addEventListener("click", function () {
    showDiv(reviewDiv);
  });

  lessReview.addEventListener("click", function () {
    showDiv(lessReviewdiv);
  });
});

document.getElementById("color").addEventListener("change", function () {
  const stock = document.getElementById("stock").value; //totalquantity
  const colour = document.getElementById("colourful").innerText; //dbdata
  const color = document.getElementById("color").value; //colour select
  const quantity = document.getElementById("quantity"); //quantity select max
  const stockElement = document.getElementById("stockText");
  const stockText = stockElement ? stockElement.value : null; //stock display
  const div = document.getElementById("div");

  const colourArr = colour.split(",").reduce((acc, val, index, array) => {
    if (index % 2 === 0) {
      acc.push([val, Number(array[index + 1])]);
    }
    return acc;
  }, []);

  const result = colourArr.find((item) => item[0] === color);

  if (result) {
    quantity.max = result[1];
    if (result[1] == 0) {
      document.getElementById("cart").disabled = true;
      document.getElementById("buyBtn").disabled = true;
      div.innerHTML = `<h5 class="text-danger mb-4" >Out of Stock</h5>`;
    } else {
      document.getElementById("cart").disabled = false;
      document.getElementById("buyBtn").disabled = false;
      div.innerHTML = `<label for="quantity" class="form-label">Stock Available</label>
                    <div class="input-group ">
                    <input type="number" id="stockText"  class="form-control text-center" value="${result[1]}" readonly >
                    </div>`;
    }
  } else {
    quantity.max = Number(stock);
    if (stock == 0) {
      document.getElementById("cart").disabled = true;
      document.getElementById("buyBtn").disabled = true;
      div.innerHTML = `<h5 class="text-danger mb-4" >Out of Stock</h5>`;
    } else {
      document.getElementById("cart").disabled = false;
      document.getElementById("buyBtn").disabled = false;
      div.innerHTML = `<label for="quantity" class="form-label">Stock Available</label>
                    <div class="input-group ">
                    <input type="number" id="stockText"  class="form-control text-center" value="${stock}" readonly >
                    </div>`;
    }
  }
});

async function addTocart() {
  let cart = false;
  const productId = document.getElementById("productId").value;
  const color = document.getElementById("color").value;
  let stock = document.getElementById("stockText").value;
  let quantity = document.getElementById("quantity").value;
  const price = document.getElementById("price").value;
  quantity = parseInt(quantity);
  stock = parseInt(stock);

  if (color == "Select a colour" || color == "") {
    Swal.fire({
      title: "SORRY!",
      text: "Please select color.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (quantity == 0) {
    Swal.fire({
      title: "SORRY!",
      text: "Please set quantity.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (quantity > stock) {
    Swal.fire({
      title: "SORRY!",
      text: "Stock is not available.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (quantity > 10) {
    Swal.fire({
      title: "SORRY!",
      text: "The maximum allowable quantity per item in the cart is 10.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else {
    cart = true;
  }

  if (cart == true) {
    try {
      const response = await fetch("/api/addTocart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, color, quantity, price }),
      });

      const data = await response.json();
      if (data.add == true) {
        Swal.fire({
          title: "Success!",
          text: "The product has been successfully added to your cart.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error adding cart item:", error);
    }
  }
}

document.getElementById("buy").addEventListener("submit", function (event) {
  const color = document.getElementById("color").value;
  let stock = document.getElementById("stockText").value;
  let quantity = document.getElementById("quantity").value;
  quantity = parseInt(quantity);
  stock = parseInt(stock);

  if (color == "Select a colour" || color == "") {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Please select color.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (quantity == 0) {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Please set quantity.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else if (quantity > stock) {
    event.preventDefault();
    Swal.fire({
      title: "SORRY!",
      text: "Stock is not available.",
      icon: "info",
      confirmButtonText: "OK",
    });
  } else {
    document.getElementById("buyQuantity").value = quantity;
    document.getElementById("colour").value = color;
  }
});

async function wishlist(id) {
  try {
    const response = await fetch("/api/addToWish", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();
    if (data.added == true) {
      Swal.fire({
        title: "Success!",
        text: "The product has been successfully added to your wishlist.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } else {
      Swal.fire({
        title: "Sorry!",
        text: "The product is already in your wishlist.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error("Error adding wishlist item:", error);
  }
}
