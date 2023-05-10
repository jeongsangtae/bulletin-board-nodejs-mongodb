const close = document.querySelector(".close");
const modal = document.getElementById("password-error-modal");

function passwordErrorModal() {
  modal.style.display = "none";
}

close.addEventListener("click", passwordErrorModal);
