import { createSprint, logout } from "../utils.js";

function triggerAddCardDialog(bool) {
  const addCardDialog = document.querySelector(".add-card-dialog");
  const background = document.querySelector(".container");

  if (bool) {
    addCardDialog.style.display = "block";
    background.style.filter = "blur(10px)";
  } else {
    addCardDialog.style.display = "none";
    background.style.filter = "blur(0px)";
  }
}

function createCard() {
  const cardName = document.querySelector("#card-name").value;
  const cardsContainer = document.querySelector(".cards-container");

  const cardElement = document.createElement("div");

  cardElement.classList.add("card");
  cardElement.innerText = cardName;

  cardsContainer.appendChild(cardElement);

  triggerAddCardDialog(false);
}

async function handleCreateSprintButton() {
  const sprintName = document.querySelector("#sprint-name").value;
  const cards = document.querySelectorAll(".card");
  const users = document.querySelector("#users");
  const usersValuesSelected = Array.from(users).map((el) => el.value);

  const cardsArray = [];

  cards.forEach((card) => {
    // check if card class is add-card
    if (card.classList.contains("add-card")) return;
    cardsArray.push(card.innerText);
  });

  // check if input is valid
  if (sprintName.length < 5 || sprintName.length > 64) {
    alert("Nome da sprint deve ter entre 5 e 64 caracteres");
    return;
  }

  if (cardsArray.length < 1) {
    alert("Sprint deve ter pelo menos 1 card");
    return;
  }

  if (users.length < 1) {
    alert("Sprint deve ter pelo menos 1 usuário");
    return;
  }

  const { data: sprintId } = await createSprint(
    sprintName,
    cardsArray,
    usersValuesSelected
  );

  window.location.href = `/dashboard/single-sprint.html?sprintId=${sprintId}`;
}

window.triggerAddCardDialog = triggerAddCardDialog;
window.createCard = createCard;
window.handleCreateSprintButton = handleCreateSprintButton;
window.logout = logout;
