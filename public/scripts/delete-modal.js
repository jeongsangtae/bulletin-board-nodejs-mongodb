const deleteErrorClose = document.getElementById("delete-error-close");
const deleteErrorModal = document.getElementById("delete-error-modal");

function deleteErrorModalClose() {
  deleteErrorModal.style.display = "none";
}

deleteErrorClose.addEventListener("click", deleteErrorModalClose);
