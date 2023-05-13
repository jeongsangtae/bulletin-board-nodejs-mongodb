// const passwordErrorModal = document.getElementById("password-error-modal");
// const passwordErrorClose = document.getElementById("password-error-close");

// const closeTimeout = 2000;

// function closeModal() {
//   passwordErrorModal.style.display = "none";
// }

// setTimeout(closeModal, closeTimeout);

// function passwordErrorModalClose() {
//   passwordErrorModal.style.display = "none";
// }

// passwordErrorClose.addEventListener("click", passwordErrorModalClose);
// console.log(passwordErrorClose);

window.onload = function () {
  const passwordErrorModal = document.getElementById("password-error-modal");
  const passwordErrorClose = document.getElementById("password-error-close");

  if (passwordErrorClose) {
    passwordErrorClose.addEventListener("click", passwordErrorModalClose);
  }

  function passwordErrorModalClose() {
    passwordErrorModal.style.display = "none";
  }
};
