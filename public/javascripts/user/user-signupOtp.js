window.onload = function () {
  const [nav] = performance.getEntriesByType("navigation");

  if (nav && nav.type === "reload") {
    console.log("Page was manually refreshed.");
  } else {
    const warning = document.getElementById("warning").innerText;
    if (warning == "Invalid or expired OTP") {
      Swal.fire({
        title: "SORRY!",
        text: warning,
        icon: "info",
        confirmButtonText: "OK",
      });
    } else if (warning) {
      Swal.fire({
        title: "Success!",
        text: warning,
        icon: "success",
        confirmButtonText: "OK",
      });
    }
    console.log("Page loaded for the first time.");
  }
};

// tym set
const timerElement = document.getElementById("timer");
let timeLeft = 300; // Timer duration in seconds

function startTimer() {
  const timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById("otp").disabled = true;
      document.getElementById("message").innerHTML =
        '<div class="text-danger">OTP expired. Please request a new one.</div>';
      document
        .getElementById("otpForm")
        .querySelector("button").disabled = true;
    }
    timeLeft--;
  }, 1000);
}

startTimer();

// Resend OTP simulation
document.getElementById("resendOtp").addEventListener("click", (e) => {
  e.preventDefault();
  timeLeft = 120; // Reset timer
  startTimer();
  document.getElementById("message").innerHTML =
    '<div class="text-success">A new OTP has been sent to your email or phone.</div>';
  document.getElementById("otpForm").querySelector("button").disabled = false;
});

// Form submission
function validate() {
  const otp = document.getElementById("otp").value.trim();
  if (otp === "") {
    event.preventDefault();
    document.getElementById("message").innerHTML =
      '<div class="text-danger">Please enter the OTP.</div>';
  } else {
    document.getElementById("message").innerHTML =
      '<div class="text-success">Verifying the OTP, please wait....</div>';
  }
}
