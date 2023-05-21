const deleteForm = document.getElementById("delete-form");
// const deleteForm = document.querySelector("form");
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
  console.log("폼을 찾았습니다.");
} else {
  console.log("폼을 찾을 수 없습니다.");
}

function deleteConfirmModalClose() {
  confirmModal.style.display = "none";
}

cancelButton.addEventListener("click", deleteConfirmModalClose);

function deletePostSubmit(event) {
  // event.preventDefault();
  deleteForm.submit();
}

if (confirmButton) {
  confirmButton.addEventListener("click", deletePostSubmit);
}
