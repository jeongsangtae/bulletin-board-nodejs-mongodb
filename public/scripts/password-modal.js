const passwordErrorModal = document.getElementById("password-error-modal");
const passwordErrorClose = document.getElementById("password-error-close");

// const closeTimeout = 2000;

// function closeModal() {
//   passwordErrorModal.style.display = "none";
// }

// setTimeout(closeModal, closeTimeout);

function passwordErrorModalClose() {
  passwordErrorModal.style.display = "none";
}

passwordErrorClose.addEventListener("click", passwordErrorModalClose);
