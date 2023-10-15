import {
  getEmailFromLoggedInUser,
  getScoresFromProject,
  getScoresFromSprint
} from "../global/utils.js";

const sprintId = new URLSearchParams(window.location.search).get("sprintId");
const projectid = new URLSearchParams(window.location.search).get("projectId");


let { data: scores, error } = await getScoresFromSprint(parseInt(sprintId));

if (sprintId) {
  const { data: s, error: e } = await getScoresFromSprint(parseInt(sprintId));
  scores = s
  error = e
} else if (projectid) {
  const { data: s, error: e } = await getScoresFromProject(projectid);
  scores = s
  error = e
}

// const { data: sprintName, error: sprintNameError } = await getSprintName(
//   parseInt(sprintId)
// );

const { data: userEmail } = await getEmailFromLoggedInUser();

// const title = document.querySelector(".title");
const table = document.querySelector(".table");

if (error) {
  title.textContent = "No data to show";
  table.style.display = "hidden";
}


// title.textContent = `Ranking for ${sprintName[0].name}`;

function getImageFromScore(score) {
  const rankImages = {
    bronze: "/static/bronze rank 2.png",
    silver: "/static/silver rank.png",
    gold: "/static/gold rank.png",
    diamond: "/static/diamond rank 1.png",
    master: "/static/master rank.png",
  };

  if (score >= 2500) {
    return rankImages.master;
  } else if (score >= 1500) {
    return rankImages.diamond;
  } else if (score >= 1000) {
    return rankImages.gold;
  } else if (score >= 500) {
    return rankImages.silver;
  } else {
    return rankImages.bronze;
  }
}

scores.map((score) => {
  const row = document.createElement("tr");
  const email = document.createElement("td");
  const scoreElement = document.createElement("td");
  const rank = document.createElement("td");
  const rankImage = document.createElement("img");

  rankImage.src = getImageFromScore(score.sp_score);

  if (score.email == userEmail) {
    row.style.backgroundColor = "#9CF51F";
    email.style.fontWeight = "bold";
  }

  email.textContent = score.email;
  scoreElement.textContent = score.sp_score;

  rank.appendChild(rankImage);
  row.appendChild(rank);
  row.appendChild(email);
  row.appendChild(scoreElement);
  table.appendChild(row);
});
