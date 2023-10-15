import {
  getCardsFromSprint,
} from "../../global/utils.js";

const sprintId = new URLSearchParams(window.location.search).get("sprintId");

const download = (data) => {

  // Creating a Blob for having a csv file format 
  // and passing the data with type 
  const blob = new Blob(["\ufeff", data], { type: 'text/csv;charset=UTF-8', encoding: 'UTF-8' });

  // Creating an object for downloading url 
  const url = window.URL.createObjectURL(blob)

  // Creating an anchor(a) tag of HTML 
  const a = document.createElement('a')

  // Passing the blob downloading url 
  a.setAttribute('href', url)

  // Setting the anchor tag attribute for downloading 
  // and passing the download file name 
  a.setAttribute('download', 'cards.csv');

  // Performing a download with click 
  a.click()
}

const csvmaker = (cards) => {

  let csvRows = [];
  const headers = Object.keys(cards[0]);

  // remove like_and_dislike
  headers.pop();

  csvRows.push([...headers, 'likes', 'dislikes'].join(','));

  cards.map((card) => {
    const likes = card.like_and_dislike.reduce((acc, like) => {
      if (like.is_like) acc++;

      return acc;
    }, 0);

    const dislikes = card.like_and_dislike.length - likes;

    const values = Object.values(card);

    values.pop();

    values.push(likes);
    values.push(dislikes);

    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

const get = async function () {
  // JavaScript object 
  const { data, error } = await getCardsFromSprint(sprintId);

  console.log(data);

  if (error) {
    console.error(error);
    return;
  }
  const csvdata = csvmaker(data);
  download(csvdata);
}

// Getting element by id and adding 
// eventlistener to listen everytime 
// button get pressed 
const btn = document.getElementById('action');
btn.addEventListener('click', get);
