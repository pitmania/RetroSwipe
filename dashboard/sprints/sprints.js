import { isScrumMaster } from "../../global/utils.js";

const { data: isUserScrumMaster } = await isScrumMaster();
const projectId = new URLSearchParams(window.location.search).get("projectId");

async function createSprint(sprint) {
  const lastAccessedSprintId =
    parseInt(window.localStorage.getItem("lastAccessedSprint")) || -1;

  const sprintElement = document.createElement("div");
  sprintElement.classList.add("sprint");

  const sprintLink = document.createElement("a");
  sprintLink.classList.add("sprint-link");

  sprintLink.href = isUserScrumMaster
    ? `/dashboard/cards-scrum-master/index.html?sprintId=${sprint.id}`
    : `/dashboard/swiping/index.html?sprintId=${sprint.id}`;

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

function redirectToRanking() {
  window.location.href = `/ranking/index.html?projectId=${projectId}`;
}

window.redirectToRanking = redirectToRanking;

async function createSprintButton() {
  if (!isUserScrumMaster) return;

  const createSprintButton = document.createElement("button");
  createSprintButton.classList.add("create-sprint-button");
  createSprintButton.innerText = `Criar Sprint +`;
  createSprintButton.addEventListener("click", () => {
    window.location.href = "/dashboard/create-sprint/index.html?projectId=" + projectId;
  });
  const sprintsListsContainer = document.querySelector(".sprints-container");
  sprintsListsContainer.appendChild(createSprintButton);
}

window.createSprint = createSprint;
window.createSprintButton = createSprintButton;

import { getSprintsWithId } from "../../global/utils.js";

const { data: sprints } = await getSprintsWithId(projectId);

sprints.map(createSprint);

await createSprintButton();