const tooltip = document.getElementById('tooltip');
const dislikeTooltipContent = document.querySelector("#dislike-tooltip");

window.showTooltip = function () {
  tooltip.style.display = 'block';
}

window.hideTooltip = function () {
  tooltip.style.display = 'none';
}
window.showDislikeTooltip = function () {
  dislikeTooltipContent.style.display = "block";
};

window.hideDislikeTooltip = function () {
  dislikeTooltipContent.style.display = "none";
};

