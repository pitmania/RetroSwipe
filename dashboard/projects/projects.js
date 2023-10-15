import { getProjects, isScrumMaster, createProject } from "../../global/utils.js";

const { data: projects } = await getProjects();
const { data: isUserScrumMaster } = await isScrumMaster();

async function createProjectElement(project) {
  const projectElement = document.createElement("div");
  projectElement.classList.add("ffolder");
  projectElement.classList.add("cyan");
  projectElement.classList.add("medium");

  const projectLink = document.createElement("a");

  projectLink.href = `/dashboard/sprints/index.html?projectId=${project.id}`

  const projectName = document.createElement("span");
  projectName.innerText = project.title;

  projectElement.appendChild(projectName);
  projectLink.appendChild(projectElement);

  const sprintsListsContainer = document.querySelector(".sprints-container");
  sprintsListsContainer.appendChild(projectLink);
}

async function createProjectOptimistic() {
  const projectName = document.querySelector("#project-name").value;

  if (projectName.length < 5) {
    alert("Project name must be at least 5 characters long");
    return;
  }

  if (projectName.length > 64) {
    alert("Project name must be at most 64 characters long");
    return;
  }

  try {

    const { data: newProject } = await createProject(projectName);
    console.log(newProject);
    createProjectElement(newProject);
    triggerAddProjectDialog(false);

  } catch (error) {
    alert("Error creating project");
    return;
  }
}

function triggerAddProjectDialog(bool) {
  const addProjectDialog = document.querySelector(".add-project-dialog");
  const background = document.querySelector(".container");

  if (bool) {
    addProjectDialog.style.display = "block";

    addProjectDialog.innerHTML = `
      <div class="add-project-dialog-content">
        <div class="add-project-dialog-header">
          <h2>Create new project</h2>
          <button
            class="close-add-project-dialog"
            onclick="triggerAddProjectDialog(false)"
          >
            X
          </button>
        </div>
        <div class="add-project-dialog-body">
          <label for="project-name">Project name:</label>
          <input type="text" id="project-name" minlength="5" maxlength="64" />
        </div>
        <div class="add-project-dialog-footer">
          <button class="submit" onclick="createProjectOptimistic()">
            Adicionar
          </button>
        </div>
      </div>`;
    background.style.filter = "blur(10px)";
  } else {
    addProjectDialog.style.display = "none";
    background.style.filter = "blur(0px)";
  }
}

window.triggerAddProjectDialog = triggerAddProjectDialog;
window.createProjectOptimistic = createProjectOptimistic;

projects.map(createProjectElement);

if (isUserScrumMaster) {
  const addProjectButton = document.querySelector(".submit");
  addProjectButton.style.display = "block";
} else {
  const addProjectButton = document.querySelector(".submit");
  addProjectButton.style.display = "none";
}