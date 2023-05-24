const textarea = document.getElementById("comment-textarea");
const boardComment = document.querySelector(".board-comment-write");

function textareaHeight() {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function textareaHeightRestore() {
  if (textarea.value.trim() === "") {
    boardComment.style.height = "auto";
  } else {
    boardComment.style.height = "100%";
  }
}

function limitTextarea() {
  const maxLength = 300;
  if (textarea.value.length > maxLength) {
    textarea.value = textarea.value.slice(0, maxLength);
  }
}

textarea.addEventListener("input", textareaHeight);
textarea.addEventListener("input", textareaHeightRestore);
textarea.addEventListener("input", limitTextarea);
