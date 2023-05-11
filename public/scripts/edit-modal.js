const editErrorClose = document.getElementById("edit-error-close");
const editErrorModal = document.getElementById("edit-error-modal");

function editErrorModalClose() {
  editErrorModal.style.display = "none";
}

editErrorClose.addEventListener("click", editErrorModalClose);
