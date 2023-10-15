import { login, getSession } from "./global/utils.js";

async function redirectOnLogin() {
  try {
    const { data: isLoggedIn } = await getSession();

    if (isLoggedIn) window.location.href = "/dashboard/projects";
  } catch (error) {
    console.error(error);
  }
}

const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
  try {
    event.preventDefault(); // prevent the form from refreshing page

    const { email, password } = event.target.elements;

    const { data } = await login(email.value, password.value);

    if (data) window.location.href = "/dashboard/projects"; // redirect after successful login
  } catch (error) {
    console.error(error);
  }
});

await redirectOnLogin();
