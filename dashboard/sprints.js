import { isScrumMaster } from "../utils.js";

function createSprint(sprint) {
  const lastAccessedSprintId =
    parseInt(window.localStorage.getItem("lastAccessedSprint")) || -1;

  const sprintElement = document.createElement("div");
  sprintElement.classList.add("sprint");

  const sprintLink = document.createElement("a");
  sprintLink.classList.add("sprint-link");
  sprintLink.href = `single-sprint.html?sprintId=${sprint.id}`;

  sprintElement.innerText = sprint.name;

  if (lastAccessedSprintId === sprint.id) {
    sprintElement.classList.add("last-accessed-sprint");
    const recentSprintElement = document.querySelector(
      ".recently-accessed-container"
    );
    recentSprintElement.appendChild(sprintLink);
  } else {
    const sprintsListsContainer = document.querySelector(".sprints-container");
    sprintsListsContainer.appendChild(sprintLink);
  }

  sprintLink.appendChild(sprintElement);
}

async function createSprintButton() {
  const { data: isUserScrumMaster } = await isScrumMaster();

  if (!isUserScrumMaster) return;

  const createSprintButton = document.createElement("button");
  createSprintButton.classList.add("create-sprint-button");
  createSprintButton.innerText = "Criar Sprint +";
  createSprintButton.addEventListener("click", () => {
    window.location.href = "create-sprint.html";
  });
  const sprintsListsContainer = document.querySelector(".sprints-container");
  sprintsListsContainer.appendChild(createSprintButton);
}

window.createSprint = createSprint;
window.createSprintButton = createSprintButton;
