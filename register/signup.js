import { register } from "../global/utils.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
  try {
    event.preventDefault(); // prevent the form from submitting

    const { email, password, repeat } = event.target.elements;

    if (password.value !== repeat.value) {
      alert("Passwords do not match!");
      return;
    }

    const { data } = await register(email.value, password.value);

    if (data) {
      alert("Register successful!");
      window.location.href = "/";
    }
  } catch (error) {
    alert(error.message);
  }
});
