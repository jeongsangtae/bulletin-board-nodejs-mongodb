const deleteForm = document.querySelector("form");
const confirmModal = document.getElementById("delete-confirm-modal");

const confirmButton = document.getElementById("btn-confirm-delete");
const cancelButton = document.getElementById("btn-cancel-delete");

const deleteButton = document.getElementById("btn-delete");

function deleteConfirmModal(event) {
  event.preventDefault();
  confirmModal.style.display = "block";
}

if (deleteButton) {
  deleteButton.addEventListener("click", deleteConfirmModal);
}

function deleteConfirmModalClose() {
  confirmModal.style.display = "none";
}

cancelButton.addEventListener("click", deleteConfirmModalClose);

function deletePostSubmit() {
  deleteForm.submit();
}

confirmButton.addEventListener("click", deletePostSubmit);
