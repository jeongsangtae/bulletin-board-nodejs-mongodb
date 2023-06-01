const textareas = document.querySelectorAll(".comment-textarea");
const boardComment = document.querySelector(".board-comment-write");

const btnCommentEdits = document.querySelectorAll(".btn-comment-edit");
const btnCommentCancels = document.querySelectorAll(".btn-comment-cancel");
const boardCommentFormEdits = document.querySelectorAll(
  ".board-comment-form-edit"
);
const btnCommentReplys = document.querySelectorAll(".btn-comment-reply");
const btnCommentFormReplys = document.querySelectorAll(
  ".board-comment-form-reply"
);
const btnCommentReplyCancels = document.querySelectorAll(
  ".btn-comment-reply-cancel"
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
    const textarea =
      boardCommentFormEdits[index].querySelector(".comment-textarea");
    textarea.value = textarea.dataset.commentContent;
    boardCommentFormEdits[index].style.display = "none";
  });
});

btnCommentReplys.forEach((btnCommentReply, index) => {
  btnCommentReply.addEventListener("click", () => {
    btnCommentFormReplys[index].style.display = "block";

    console.log("전송됨")

    const postId = btnCommentReply.dataset.postId;
    const commentId = btnCommentReply.dataset.commentId;
    const data = {
      commentId: commentId,
    };

    fetch(`/posts/${postId}/comments/replies`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        alert("무엇인가 잘못된 거 같습니다. data");
      })
      .catch((error) => {
        console.error(error)
        alert("무엇인가 잘못된 거 같습니다. error");
      });
  });
});

btnCommentReplyCancels.forEach((btnCommentReplyCancel, index) => {
  btnCommentReplyCancel.addEventListener("click", () => {
    // const textarea = boardCommentFormEdits[index].querySelector(".comment-textarea");
    // textarea.value = textarea.dataset.commentContent;
    btnCommentFormReplys[index].style.display = "none";
  });
});
