import {
  createNewIdeaCard,
  getCardsFromSprint,
  subscribeToCards,
  readComments,
  likeOrDislikeComment,
  getSprintName,
  getSession
} from "../../global/utils.js";

const sprintId = new URLSearchParams(window.location.search).get("sprintId");
const { data: cards } = await getCardsFromSprint(sprintId);

const { data: sprintName } = await getSprintName(sprintId);
document.querySelector(".sprint-name").innerText = sprintName[0].name;

const goingWell = document.querySelector(".going-well");
const needsImprovement = document.querySelector(".needs-improvement");
const ideasToTry = document.querySelector(".ideas-to-try");

function addCardWithoutLikes(cardElement, card) {
  cardElement.innerHTML = `
    <div class="card-header" data-card-id="">
      <h2 class="card-title"></h2>
    </div>
  `;

  cardElement.querySelector(".card-header").dataset.cardId = card.id;
  cardElement.querySelector(".card-title").innerText = card.title;
}

function addCardWithLikes(cardElement, card, likes, dislikes) {
  cardElement.innerHTML = `
    <div class="card-header" data-card-id="">
      <h2 class="card-title"></h2>
      <div class="likes"></div>
      <div class="dislikes"></div>
    </div>
  `;


  cardElement.querySelector(".card-header").dataset.cardId = card.id;
  cardElement.querySelector(".card-title").innerText = card.title;
  cardElement.querySelector(".likes").innerHTML = `${thumbsUp} ${likes}`;
  cardElement.querySelector(".dislikes").innerHTML = `${thumbsDown} ${dislikes}`;
}

await subscribeToCards((payload) => {
  const isFromThisSprint = payload.new.sprint_id == sprintId;
  // insert new card if is an idea to try
  if (payload.new.card_type === "idea_to_try" && isFromThisSprint) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");

    addCardWithoutLikes(cardElement, payload.new);

    const ideasToTry = document.querySelector(".ideas-to-try");
    ideasToTry.appendChild(cardElement);
  }
}, sprintId);

cards.forEach((card) => {
  const cardElement = document.createElement("div");
  cardElement.classList.add("card");

  const likes = card.like_and_dislike.reduce((acc, like) => {
    if (like.is_like) acc++;

    return acc;
  }, 0);

  const dislikes = card.like_and_dislike.length - likes;

  addCardWithLikes(cardElement, card, likes, dislikes);

  if (card.card_type === "normal") {
    if (likes > dislikes) {
      goingWell.appendChild(cardElement);
      cardElement.addEventListener("click", () => {
        openCommentSection(card.id, "green");
      });
    } else {
      needsImprovement.appendChild(cardElement);
      cardElement.addEventListener("click", () => {
        openCommentSection(card.id, "yellow");
      });
    }
  }

  if (card.card_type === "idea_to_try") {
    addCardWithoutLikes(cardElement, card);
    ideasToTry.appendChild(cardElement);
  }
});

async function openCommentSection(cardId, color = "white") {
  const { data: comments } = await readComments(cardId);
  const { data: session } = await getSession();

  const colors = {
    green: "#71D07B",
    yellow: "#EAED73",
    white: "#FFFFFF"
  }

  const commentSection = document.querySelector(".add-card-dialog");
  commentSection.style.backgroundColor = colors[color] || colors.white;

  const userId = session.session.user.id;

  const likeCount = commentsLikesAndDislikes => commentsLikesAndDislikes.filter(like => like.is_like).length;
  const dislikeCount = commentsLikesAndDislikes => commentsLikesAndDislikes.filter(like => !like.is_like).length;
  const hadCommentAlredyDisliked = commentsLikesAndDislikes => commentsLikesAndDislikes.some(like => like.user_id === userId && !like.is_like);
  const hadCommentAlreadyLiked = commentsLikesAndDislikes => commentsLikesAndDislikes.some(like => like.user_id === userId && like.is_like);

  commentSection.innerHTML = `
    <div class="comment-section-header" style="display: flex; justify-content: space-between;">
      <h2>Comments</h2>
      <button onclick="closeCommentSection()" class="close-add-card-dialog">X</button>
    </div>
    <div class="comment-section-body">
      <div class="comments">
        ${comments.map(comment => {
    comment.comment = sanitizeHTML(comment.comment);
    const userLikedTheCard = comment.like_and_dislike[0].is_like;
    return (`
          <div class="comment" data-comment-id="${comment.id}">
          <div class="comment-container">
          ${userLikedTheCard ? `
          <span class="like">
            ${thumbsUp}
          </span>` : `
          <span class="dislike">
            ${thumbsDown}
          </span>`}
            <p class="comment-content">${comment.comment}</p>
            </div>
            <div class="btns-container">
            <div class="likes-btn ${hadCommentAlreadyLiked(comment.like_and_dislike_on_comments) ? "liked" : ""}" onclick="likeComment(${comment.id})">${thumbsUp} ${likeCount(comment.like_and_dislike_on_comments)}</div>
            <div class="dislikes-btn ${hadCommentAlredyDisliked(comment.like_and_dislike_on_comments) ? "disliked" : ""}"  onclick="dislikeComment(${comment.id})">${thumbsDown} ${dislikeCount(comment.like_and_dislike_on_comments)}</div>
            </div>

          </div>
        `)
  }).join("")}
      </div>
    </div>
  `;

  commentSection.style.display = "block";

  const background = document.querySelector(".container");

  background.style.filter = "blur(10px)";

}

function sanitizeHTML(str) {
  return str.replace(/[^\w. ]/gi, (char) => {
    return '&#' + char.charCodeAt(0) + ';';
  });
};

function errorHandle(error) {
  console.error(error.message);
  if (error.message.includes("duplicate key value violates unique constraint")) {
    return ("You already liked or disliked this comment");
  }

  if (error.message.includes("new row violates row-level security policy")) {
    return ("You can't like your own comment");
  }

  return (error.message);
}

async function likeComment(commentId) {
  try {
    const userAlreadyLiked = document.querySelector(".liked");
    const userAlreadyDisliked = document.querySelector(".disliked");

    if (userAlreadyLiked || userAlreadyDisliked) {
      alert("You already liked or disliked a comment on this card");
      return;
    }

    await likeOrDislikeComment(commentId, true);

    // update ui
    const comment = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
    const likes = comment.querySelector(".likes-btn");
    const currentCount = parseInt(likes.innerText);
    likes.innerHTML = `${thumbsUp} ${currentCount + 1}`;
    // if there is not a class of liked, add it
    likes.classList.add("liked");
  }
  catch (error) {
    alert(errorHandle(error));
  }
}

async function dislikeComment(commentId) {
  try {
    // check if user already liked some comment on the card
    const userAlreadyLiked = document.querySelector(".liked");
    const userAlreadyDisliked = document.querySelector(".disliked");

    if (userAlreadyLiked || userAlreadyDisliked) {
      alert("You already liked or disliked a comment on this card");
      return;
    }

    await likeOrDislikeComment(commentId, false);
    // update ui
    const comment = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
    const dislikes = comment.querySelector(".dislikes-btn");
    const currentCount = parseInt(dislikes.innerText);
    dislikes.innerHTML = `${thumbsDown} ${currentCount + 1}`;
    // if there is not a class of liked, add it
    dislikes.classList.add("disliked");
  }
  catch (error) {
    alert(errorHandle(error));
  }
}

function closeCommentSection() {
  const commentSection = document.querySelector(".add-card-dialog");
  commentSection.style.backgroundColor = "white"; // reset color
  commentSection.style.display = "none";

  const background = document.querySelector(".container");

  background.style.filter = "blur(0px)";
}

async function createCard() {
  triggerAddCardDialog(false);
  await createNewIdeaCard(
    sprintId,
    document.querySelector("#card-name").value,
    ""
    // document.querySelector("#card-description").value
  );
}

function triggerAddCardDialog(bool) {
  const addCardDialog = document.querySelector(".add-card-dialog");
  const background = document.querySelector(".container");

  if (bool) {
    addCardDialog.style.display = "block";

    addCardDialog.innerHTML = `
      <div class="add-card-dialog-content">
        <div class="add-card-dialog-header">
          <h2>Adicionar Card</h2>
          <button
            class="close-add-card-dialog"
            onclick="triggerAddCardDialog(false)"
          >
            X
          </button>
        </div>
        <div class="add-card-dialog-body">
          <label for="card-name">Nome do Card:</label>
          <input type="text" id="card-name" minlength="5" maxlength="64" />
        </div>
        <div class="add-card-dialog-footer">
          <button class="add-card-button" onclick="createCard()">
            Adicionar
          </button>
        </div>
      </div>`;
    background.style.filter = "blur(10px)";
  } else {
    addCardDialog.style.display = "none";
    background.style.filter = "blur(0px)";
  }
}

window.triggerAddCardDialog = triggerAddCardDialog;
window.createCard = createCard;
window.openCommentSection = openCommentSection;
window.closeCommentSection = closeCommentSection;
window.likeComment = likeComment;
window.dislikeComment = dislikeComment;