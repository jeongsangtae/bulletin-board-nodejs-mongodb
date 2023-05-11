const passwordErrorClose = document.getElementById("password-error-close");
const passwordErrorModal = document.getElementById("password-error-modal");

function passwordErrorModalClose() {
  passwordErrorModal.style.display = "none";
}

passwordErrorClose.addEventListener("click", passwordErrorModalClose);
