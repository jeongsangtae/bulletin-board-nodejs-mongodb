const editPasswordErrorModal = document.getElementById(
  "edit-password-error-modal"
);
const editPasswordErrorClose = document.getElementById(
  "edit-password-error-close"
);

function editPasswordErrorModalClose() {
  editPasswordErrorModal.style.display = "none";
}

if (editPasswordErrorClose) {
  editPasswordErrorClose.addEventListener("click", editPasswordErrorModalClose);
}
