const passwordErrorModal = document.getElementById("password-error-modal");
const passwordErrorClose = document.getElementById("password-error-close");

function passwordErrorModalClose() {
  passwordErrorModal.style.display = "none";
}

if (passwordErrorClose) {
  passwordErrorClose.addEventListener("click", passwordErrorModalClose);
}

// console.log(passwordErrorClose);

// window.onload = function () {
//   const passwordErrorModal = document.getElementById("password-error-modal");
//   const passwordErrorClose = document.getElementById("password-error-close");

//   if (passwordErrorClose) {
//     passwordErrorClose.addEventListener("click", passwordErrorModalClose);
//   }

//   function passwordErrorModalClose() {
//     passwordErrorModal.style.display = "none";
//   }
// };
