import {
  createComment,
  getAllNormalCardsFromSprint,
  getAllPlayersThatShouldVote,
  getCardsFromSprintToVote,
  likeOrDislikeCard,
  subscribeToLike
} from "../../global/utils.js";

const sprintId = new URLSearchParams(window.location.search).get("sprintId");

window.localStorage.setItem("lastAccessedSprint", sprintId);

const { data: players } = await getAllPlayersThatShouldVote(sprintId);
var { data: cards } = await getCardsFromSprintToVote(sprintId);
const { data: allCards } = await getAllNormalCardsFromSprint(sprintId);
await redirectOnVotingEnd(allCards, players.length);

const cardsContainer = document.querySelector(".cards-container");

cards.forEach((card) => {
  const cardElement = document.createElement("div");
  cardElement.classList.add("card");

  cardElement.innerHTML = `
    <div class="card-header" data-card-id="">
      <h2 class="card-title"></h2>
      <div class="description"></div>
      <div style="display: flex; flex-direction: column; align-items: center;">
      <label for="comment">Comment</label>
      <textarea class="comment" id="comment" placeholder="A comment about this card"></textarea>
      </div>
    </div>
  `;

  cardElement.querySelector(".card-header").dataset.cardId = card.id;
  cardElement.querySelector(".card-title").innerText = card.title;
  cardElement.querySelector(".description").innerText = card.description;


  cardsContainer.appendChild(cardElement);
});

await subscribeToLike(async () => {
  const { data: updatedCards } = await getAllNormalCardsFromSprint(sprintId);
  await redirectOnVotingEnd(updatedCards, players.length);
});

async function vote(isLike) {
  const currentCard = cards.pop();
  const currentCardInDOM = document.querySelector(
    `[data-card-id="${currentCard.id}"]`
  );
  const comment = currentCardInDOM.querySelector("#comment").value;
  // find parent component of currentCardInDom with classname card
  // add swipe-right or swipe-left class to it
  currentCardInDOM.parentElement.classList.add(
    isLike ? "swipe-right" : "swipe-left"
  );

  if (comment.length > 0) {
    const { data } = await createComment(currentCard.id, comment);
    await likeOrDislikeCard(currentCard.id, isLike, data[0].id);
  } else {
    await likeOrDislikeCard(currentCard.id, isLike);
  }
}

async function redirectOnVotingEnd(cards, numOfPlayers) {
  let hasVotingEnded = true;

  cards.map((card) => {
    if (card.like_and_dislike.length < numOfPlayers) {
      hasVotingEnded = false;
    }
  });

  if (!hasVotingEnded) return;

  // if (channel) await unsubscribeChannel(channel);

  // redirect to statistics
  window.location.href = `/dashboard/sprint-results/index.html?sprintId=${sprintId}`;
}

window.vote = vote;