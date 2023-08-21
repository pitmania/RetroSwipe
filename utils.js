import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const supabase = createClient(
  "https://yzdfjptxgcgsowohlmlf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGZqcHR4Z2Nnc293b2hsbWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk3MDk5NTgsImV4cCI6MjAwNTI4NTk1OH0.1zpNEFGKehpPwfd39BvyYvAHua6k-feb6b5LyD6MQLE"
);

/**
 *
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise<{data: any}>} - The user's data
 */

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return { data };
}

/**
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise<{data: any}>} - The user's data
 * @throws {Error} - The error thrown by Supabase client
 * @description Registers a new user
 * @example
 */
export async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return { data };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) return null;

  return { data };
}

export async function isScrumMaster() {
  const session = await getSession();

  if (!session) return (window.location.href = "/");

  const userId = session.data.session.user.id;

  const { error, data } = await supabase
    .from("users")
    .select("is_scrum_master")
    .eq("id", userId);

  if (error) throw new Error(error.message);

  return { data: data[0].is_scrum_master };
}

export async function getSprints() {
  const session = await getSession();

  if (!session) return (window.location.href = "/");

  const userId = session.data.session.user.id;

  let { error, data: sprintIds } = await supabase
    .from("sprint_user")
    .select()
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  sprintIds = sprintIds.map((sprint) => sprint.sprint_id);

  const { error: sprintError, data } = await supabase
    .from("sprint")
    .select()
    .in("id", sprintIds);

  if (sprintError) throw new Error(sprintError.message);

  return { data };
}

export async function getCardsFromSprint(sprintId) {
  const { data: session } = await getSession();

  if (!session) return (window.location.href = "/");

  const { error, data } = await supabase
    .from("card")
    .select("*, like_and_dislike (user_id, is_like)")
    .eq("sprint_id", sprintId);

  if (error) throw new Error(error.message);

  return { data };
}

/**
 * @param {string} sprintName - The sprint's name
 * @param {string[]} cards - The cards' names
 * @param {string[]} users - The users' emails
 * @returns {Promise<string>} - The sprint's id
 * @throws {Error} - The error thrown by Supabase client
 * @description Creates a new sprint
 */

export async function createSprint(sprintName, cards, users) {
  const { data: session } = await getSession();

  if (!session) return (window.location.href = "/");

  const { data: sprint, error } = await supabase
    .from("sprint")
    .insert({ name: sprintName })
    .select("id");

  if (error) throw new Error(error.message);

  const sprintId = sprint[0].id;

  const { data: usersIds } = await supabase
    .from("users")
    .select("id")
    .in("email", users);

  await supabase
    .from("sprint_user")
    .insert(
      usersIds.map((user) => ({ sprint_id: sprintId, user_id: user.id }))
    );

  await supabase
    .from("card")
    .insert(cards.map((card) => ({ sprint_id: sprintId, title: card })));

  return { data: sprintId };
}

export async function getPublicUsers() {
  const { error, data } = await supabase.from("users").select("email");

  if (error) throw new Error(error.message);

  return { data };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);

  return { data: "success" };
}

export async function likeOrDislikeCard(cardId, isLike) {
  const { data: session } = await getSession();

  if (!session) return (window.location.href = "/");

  const { data, error } = await supabase
    .from("like_and_dislike")
    .insert({
      card_id: cardId,
      user_id: session.session.user.id,
      is_like: isLike,
    })
    .select();

  if (error) throw new Error(error.message);

  return { data };
}

export async function subscribeToLike(callback) {
  const { data: session } = await getSession();

  if (!session) return (window.location.href = "/");

  const channel = await supabase
    .channel("like")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "like_and_dislike",
      },
      callback
    )
    .subscribe();

  return { data: channel };
}

export async function getLikesFromCards(cardIds) {
  const { data, error } = await supabase
    .from("like_and_dislike")
    .select("card_id, is_like", { count: "exact" })
    .in("card_id", cardIds);

  if (error) throw new Error(error.message);

  return { data };
}

export async function unsubscribeChannel(channel) {
  await supabase.removeSubscription(channel);
}
