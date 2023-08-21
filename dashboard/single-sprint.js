import { getCardsFromSprint, subscribeToLike } from "../utils.js";

const sprintId = new URLSearchParams(window.location.search).get("sprintId");

window.localStorage.setItem("lastAccessedSprint", sprintId);

const { data: cards } = await getCardsFromSprint(sprintId);

const cardsContainer = document.querySelector(".cards-container");

cards.forEach((card) => {
  const cardElement = document.createElement("div");
  cardElement.classList.add("card");
  const likes = card.like_and_dislike.reduce((acc, like) => {
    if (like.is_like) {
      acc++;
    }

    return acc;
  }, 0);

  const dislikes = card.like_and_dislike.length - likes;

  cardElement.innerHTML = `
    <div class="card-header" data-card-id="${card.id}">
      <h2>${card.title}</h2>
      <div class="likes">likes: ${likes}</div>
      <div class="dislikes">dislikes: ${dislikes}</div>
    </div>
  `;

  cardsContainer.appendChild(cardElement);
});

await subscribeToLike(async (payload) => {
  const isLike = payload.new.is_like;
  const cardId = payload.new.card_id;

  const cardElement = document.querySelector(
    `.card-header[data-card-id="${cardId}"]`
  );

  const likesElement = cardElement.querySelector(".likes");
  const dislikesElement = cardElement.querySelector(".dislikes");

  const likes = parseInt(likesElement.innerText.split(" ")[1]);
  const dislikes = parseInt(dislikesElement.innerText.split(" ")[1]);

  if (isLike) {
    likesElement.innerText = `likes: ${likes + 1}`;
  } else {
    dislikesElement.innerText = `dislikes: ${dislikes + 1}`;
  }
});
