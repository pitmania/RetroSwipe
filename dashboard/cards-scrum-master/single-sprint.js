import {
  getAllPlayersThatShouldVote,
  getAllNormalCardsFromSprint,
  getCardsFromSprintToVote,
  subscribeToLike
} from "../../global/utils.js";

async function initialize() {
  const sprintId = new URLSearchParams(window.location.search).get("sprintId");

  // save last sprint id accessed in local storage
  window.localStorage.setItem("lastAccessedSprint", sprintId); // used in voting.js

  const { data: cards } = await getCardsFromSprintToVote(sprintId);
  const { data: players } = await getAllPlayersThatShouldVote(sprintId);

  await redirectOnVotingEnd(players.length, sprintId);

  // draw each card
  cards.forEach((card) => createNewCardInDOM(card, players));

  await subscribeToLike(async (payload) => {
    const cardId = payload.new.card_id;
    const isLike = payload.new.is_like;
    const cardElement = document.querySelector(
      `.card-header[data-card-id="${cardId}"]`
    );

    if (!cardElement) return; // card is not on the page (sprint)

    increaseLikeOrDislike(cardElement, isLike, players.length);

    await redirectOnVotingEnd(players.length, sprintId);
  });
}

function createNewCardInDOM(card, players) {
  const cardsContainer = document.querySelector(".cards-container");

  const cardElement = document.createElement("div");
  cardElement.classList.add("card");
  const likes = card.like_and_dislike.reduce((acc, like) => {
    if (like.is_like) acc++;

    return acc;
  }, 0);

  const dislikes = card.like_and_dislike.length - likes;

  // create html structure
  cardElement.innerHTML = `
    <div class="card-header" data-card-id="">
      <h2 class="card-title"></h2>
      <div class="total-votes"></div>
      <div class="voted"></div>
      <div class="likes-dislikes-wrapper">
      <div class="dislikes"></div>
      <div class="likes"></div>
      </div>
    </div>
  `;

  // set data attributes (preventing XSS)
  cardElement.querySelector(".card-header").dataset.cardId = card.id;
  cardElement.querySelector(".card-title").innerText = card.title;
  cardElement.querySelector(".likes").innerHTML = `${thumbsUp} ${likes}`;
  cardElement.querySelector(".dislikes").innerHTML = `${thumbsDown} ${dislikes}`;
  cardElement.querySelector(
    ".total-votes"
  ).innerText = `${likes + dislikes} / ${players.length}`;


  cardsContainer.appendChild(cardElement);
}

function increaseLikeOrDislike(cardElement, isLike, numOfPlayers) {
  const likesElement = cardElement.querySelector(".likes");
  const dislikesElement = cardElement.querySelector(".dislikes");
  const totalVotesElement = cardElement.querySelector(".total-votes");

  const likes = parseInt(likesElement.innerText);
  const dislikes = parseInt(dislikesElement.innerText);

  totalVotesElement.innerText = `${likes + dislikes + 1} / ${numOfPlayers}`;

  if (isLike) {
    likesElement.innerHTML = `${thumbsUp} ${likes + 1}`;
  } else {
    dislikesElement.innerHTML = `${thumbsDown} ${dislikes + 1}`;
  }


  if (likes + dislikes + 1 === numOfPlayers) {
    cardElement.querySelector(".voted").innerHTML = check; // from above script tag in index.html
  }
}

async function redirectOnVotingEnd(numOfPlayers, sprintId) {
  const { data: cards } = await getAllNormalCardsFromSprint(sprintId);

  let hasVotingEnded = true;

  cards.map((card) => {
    if (card.like_and_dislike.length < numOfPlayers) {
      hasVotingEnded = false;
    }
  });

  if (!hasVotingEnded) return;

  // redirect to statistics
  window.location.href = `/dashboard/sprint-results/index.html?sprintId=${sprintId}`;
}

initialize();