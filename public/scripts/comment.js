// const textarea = document.getElementById("comment-textarea");
// const boardComment = document.querySelector(".board-comment");

// function textareaHeight() {
//   textarea.style.height = "auto";
//   textarea.style.height = `${textarea.scrollHeight}px`;
//   boardComment.style.height = `${boardComment.scrollHeight}px`;
// }

// function textareaHeightRestore() {
//   if (textarea.value.trim() === "") {
//     textarea.style.height = "auto";
//     boardComment.style.height = "7rem";
//   }
// }

// function deleteContent() {
//   textareaHeight();
//   if (textarea.value.trim() === "") {
//     boardComment.style.height = "7rem";
//   }
// }

// textarea.addEventListener("input", textareaHeight);
// textarea.addEventListener("input", textareaHeightRestore);
// textarea.addEventListener("input", deleteContent);

const textarea = document.getElementById("comment-textarea");
const commentContainer = document.querySelector(".comment-container");

textarea.addEventListener("input", () => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
});

textarea.addEventListener("input", () => {
  if (textarea.value.trim() === "") {
    commentContainer.style.height = "auto";
  } else {
    commentContainer.style.height = "100%";
  }
});
