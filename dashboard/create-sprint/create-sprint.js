import { createSprint, logout } from "../../global/utils.js";

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
  const users = document.querySelector("#users").selectedOptions;
  const usersValuesSelected = Array.from(users).map((el) => el.value);

  const cardsArray = [];

  cards.forEach((card) => {
    // check if card class is add-card
    if (card.classList.contains("add-card")) return;
    cardsArray.push(card.innerText);
  });

  if (!sprintName) return alert("Please enter a sprint name");

  if (!cardsArray.length) return alert("Please add at least one card");

  if (!usersValuesSelected.length) return alert("Please select at least one user");

  try {
    const { data: sprintId } = await createSprint(
      sprintName,
      cardsArray,
      usersValuesSelected
    );

    window.location.href = `/dashboard/cards-scrum-master/index.html?sprintId=${sprintId}`;
  } catch (error) {
    alert(error.message);
  }

}

window.triggerAddCardDialog = triggerAddCardDialog;
window.createCard = createCard;
window.handleCreateSprintButton = handleCreateSprintButton;
window.logout = logout;
