import { login } from "./utils.js";

const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
  try {
    event.preventDefault(); // prevent the form from refreshing page

    const { email, password } = event.target.elements;

    const { data } = await login(email.value, password.value);

    if (data) {
      alert("Login successful!");
      window.location.href = "/dashboard/cards.html"; // redirect after successful login
    }
  } catch (error) {
    alert(error.message ?? "Unkown error"); // same as `if (error.message) alert(error.message) else alert("Unkown error")`
    console.error(error);
  }
});
