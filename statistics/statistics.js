import { getStatisticsFromAllSprints } from "../global/utils.js";

const { data: statistics } = await getStatisticsFromAllSprints();

const tableBody = document.querySelector("tbody");

statistics.map((stat) => {
  const row = document.createElement("tr");
  const sprint = document.createElement("td");
  const cards = document.createElement("td");
  const members = document.createElement("td");
  const upvotes = document.createElement("td");
  const downvotes = document.createElement("td");
  const date = document.createElement("td");

  cards.textContent = stat.card_count;
  members.textContent = stat.member_count;
  upvotes.textContent = stat.total_likes;
  downvotes.textContent = stat.total_dislikes;
  const newDate = new Date(stat.created_at);
  date.textContent = new Intl.DateTimeFormat("pt-br").format(newDate);

  // create a `a` element outside card name
  const cardLink = document.createElement("a");
  cardLink.href = `/statistics/single-sprint/index.html?sprintId=${stat.id}`;
  cardLink.textContent = stat.name;

  sprint.appendChild(cardLink);

  row.appendChild(sprint);
  row.appendChild(cards);
  row.appendChild(members);
  row.appendChild(upvotes);
  row.appendChild(downvotes);
  row.appendChild(date);

  tableBody.appendChild(row);
});