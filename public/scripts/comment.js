const textareas = document.querySelectorAll(".comment-textarea");
const boardComment = document.querySelector(".board-comment-write");
const btnCommentEdits = document.querySelectorAll(".btn-comment-edit");
const btnCommentCancels = document.querySelectorAll(".btn-comment-cancel");
const boardCommentFormEdits = document.querySelectorAll(
  ".board-comment-form-edit"
);

function textareaHeight() {
  const textarea = this;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function textareaHeightRestore() {
  const textarea = this;
  if (textarea.value.trim() === "") {
    boardComment.style.height = "auto";
  } else {
    boardComment.style.height = "100%";
  }
}

function limitTextarea() {
  const textarea = this;
  const maxLength = 300;
  if (textarea.value.length > maxLength) {
    textarea.value = textarea.value.slice(0, maxLength);
  }
}

textareas.forEach((textarea) => {
  textarea.addEventListener("input", textareaHeight);
  textarea.addEventListener("input", textareaHeightRestore);
  textarea.addEventListener("input", limitTextarea);
});

btnCommentEdits.forEach((btnCommentEdit, index) => {
  btnCommentEdit.addEventListener("click", () => {
    boardCommentFormEdits[index].style.display = "block";
  });
});

btnCommentCancels.forEach((btnCommentCancel, index) => {
  btnCommentCancel.addEventListener("click", () => {
    const textarea = boardCommentFormEdits[index].querySelector(".comment-textarea");
    textarea.value = textarea.dataset.commentContent;
    boardCommentFormEdits[index].style.display = "none";
  });
});
