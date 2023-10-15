import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const supabase = createClient(
  "https://yzdfjptxgcgsowohlmlf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGZqcHR4Z2Nnc293b2hsbWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk3MDk5NTgsImV4cCI6MjAwNTI4NTk1OH0.1zpNEFGKehpPwfd39BvyYvAHua6k-feb6b5LyD6MQLE"
);

// * AUTHENTICATION and USER MANAGEMENT

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

export async function logout() {
  // window.localStorage.clear();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);

  window.location.reload();
  return { data: "success" };
}

export async function isScrumMaster() {
  const session = await getSession();

  if (!session) return (window.location.href = "/");

  const userId = session.data.session.user.id;

  const { error, data } = await supabase
    .from("users")
    .select("is_scrum_master")
    .eq("id", userId)
    .limit(1)
    .single();

  if (error) throw new Error(error.message);

  return { data: data.is_scrum_master, session };
}

export async function getPublicUsers() {
  const { error, data } = await supabase.from("users").select("email");

  if (error) throw new Error(error.message);

  return { data };
}

// * SPRINTS MANAGEMENT

export async function getSprints() {
  const { data: isSM, session } = await isScrumMaster();

  if (isSM) {
    let { error, data } = await supabase.from("sprint").select();

    if (error) throw new Error(error.message);

    return { data };
  }

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
export async function getSprintsWithId(projectId) {
  const { data: isSM, session } = await isScrumMaster();

  if (isSM) {
    let { error, data } = await supabase.from("sprint").select().eq("project_id", projectId);

    if (error) throw new Error(error.message);

    return { data };
  }

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
    .eq("project_id", projectId)
    .in("id", sprintIds);

  if (sprintError) throw new Error(sprintError.message);

  return { data };
}
/**
 * @param {string} sprintName - The sprint's name
 * @param {string[]} cards - The cards' names
 * @param {string[]} users - The users' emails
 * @param {string} projectId - The project's id
 * @returns {Promise<string>} - The sprint's id
 * @throws {Error} - The error thrown by Supabase client
 * @description Creates a new sprint
 */

export async function createSprint(sprintName, cards, users, projectId) {
  const { data: sprint, error } = await supabase
    .from("sprint")
    .insert({ name: sprintName, project_id: projectId })
    .select("id");

  if (error) throw new Error(error.message);

  const sprintId = sprint[0].id;

  const { data: usersIds, error: userSelectError } = await supabase
    .from("users")
    .select("id")
    .in("email", users);

  if (userSelectError) throw new Error(userSelectError.message);

  const { error: sprintUserRelationError } = await supabase
    .from("sprint_user")
    .insert(
      usersIds.map((user) => ({ sprint_id: sprintId, user_id: user.id }))
    );

  if (sprintUserRelationError) throw new Error(sprintUserRelationError.message);

  const { error: cardCreateError } = await supabase
    .from("card")
    .insert(cards.map((card) => ({ sprint_id: sprintId, title: card.name, description: card.description, card_type: 'normal' })));

  if (cardCreateError) throw new Error(cardCreateError.message);

  return { data: sprintId, error };
}

export async function getSprintName(sprintId) {
  const { data, error } = await supabase
    .from("sprint")
    .select("name")
    .eq("id", sprintId);

  if (error) throw new Error(error.message);

  return { data };
}

// * CARDS MANAGEMENT

export async function getCardsFromSprint(sprintId) {
  const { error, data } = await supabase
    .from("card")
    .select("*, like_and_dislike (user_id, is_like)")
    .eq("sprint_id", sprintId);

  if (error) throw new Error(error.message);

  return { data };
}

export async function getAllNormalCardsFromSprint(sprintId) {
  const { error, data } = await supabase
    .from("card")
    .select("*, like_and_dislike (user_id, is_like)")
    .eq("sprint_id", sprintId)
    .eq("card_type", "normal");

  if (error) throw new Error(error.message);

  return { data };
}

export async function getCardsFromSprintToVote(sprintId) {
  const session = await getSession();

  if (!session) return (window.location.href = "/");

  const userId = session.data.session.user.id;

  // if there the user already made a like or dislike, dont pick it
  const { error, data } = await supabase
    .from("card")
    .select("*, like_and_dislike(user_id, is_like)")
    .eq("sprint_id", sprintId)
    .eq("card_type", "normal")

  const newData = data.filter((card) => {
    const hasUserVoted = card.like_and_dislike.find(
      (likeAndDislike) => likeAndDislike.user_id === userId
    );

    return !hasUserVoted;
  });

  if (error) throw new Error(error.message);

  return { data: newData };
}

export async function createNewIdeaCard(sprintId, cardName, description) {
  const { data, error } = await supabase
    .from("card")
    .insert({ sprint_id: sprintId, title: cardName, description, card_type: 'idea_to_try' })
    .select();

  if (error) throw new Error(error.message);

  return { data };
}

export async function likeOrDislikeCard(cardId, isLike, commentId = null) {
  const { data: session } = await getSession();

  if (!session) return (window.location.href = "/");

  const { data, error } = await supabase
    .from("like_and_dislike")
    .insert({
      card_id: cardId,
      user_id: session.session.user.id,
      is_like: isLike,
      comment_id: commentId
    })
    .select();

  if (error) throw new Error(error.message);

  return { data };
}

export async function getLikesFromCards(cardIds) {
  const { data, error } = await supabase
    .from("like_and_dislike")
    .select("card_id, is_like", { count: "exact" })
    .in("card_id", cardIds);

  if (error) throw new Error(error.message);

  return { data };
}

// * COMMENTS MANAGEMENT

export async function createComment(cardId, comment) {
  const { data: session } = await getSession();

  if (!session) return (window.location.href = "/");

  const user_id = session.session.user.id;

  const { data, error } = await supabase
    .from("comment")
    .insert({ card_id: cardId, comment, user_id })
    .select();

  if (error) throw new Error(error.message);

  return { data };
}

export async function readComments(cardId) {
  const { data, error } = await supabase
    .from("comment")
    .select("*, like_and_dislike_on_comments(*), like_and_dislike(user_id, is_like, comment_id)")
    .eq("card_id", cardId);

  if (error) throw new Error(error.message);
  console.log('data', data);
  return { data };
}

export async function likeOrDislikeComment(commentId, is_like) {
  const { data: session } = await getSession();

  if (!session) return (window.location.href = "/");

  const user_id = session.session.user.id;

  const { data, error } = await supabase
    .from("like_and_dislike_on_comments")
    .insert({ comment_id: commentId, user_id, is_like })
    .select();

  if (error) throw new Error(error.message);

  return { data, error };
}

// * SUBSCRIPTIONS

export async function subscribeToLike(callback) {
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

export async function subscribeToCards(callback, sprintId) {
  const channel = await supabase
    .channel("cards")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "card",
        filter: `sprint_id=eq.${sprintId}`,
      },
      callback
    )
    .subscribe();

  return { data: channel };
}

export async function unsubscribeChannel(channel) {
  await supabase.removeSubscription(channel);
}

// * STATISTICS MANAGEMENT

export async function getScoresFromSprint(sprintId) {
  let { data, error } = await supabase
    .rpc('get_scores_2', {
      spid: sprintId
    })

  if (error) throw new Error(error.message);

  return { data };
}

export async function getScoresFromProject(projectId) {
  let { data, error } = await supabase
    .rpc('get_project_scores', {
      pid: projectId
    })

  if (error) throw new Error(error.message);

  return { data };

}

export async function getStatisticsFromAllSprints() {
  const { data, error } = await supabase
    .from("sprint_summary")
    .select("*")

  if (error) throw new Error(error.message);

  return { data };
}

export async function getStatisticsFromOneSprint(sprintId) {
  const { data, error } = await supabase
    .from("sprint_summary")
    .select("*")
    .eq("id", sprintId);

  if (error) throw new Error(error.message);

  return { data };
}

export async function getMostLikedCardsFromSprint(sprintId) {
  const { data, error } = await supabase
    .from("card_likes_view")
    .select("*")
    .eq("sprint_id", sprintId)
    .order("like_proportion", { ascending: false })

  if (error) throw new Error(error.message);

  return { data };
}

// * UTILITY FUNCTIONS
export async function getAllPlayersThatShouldVote(sprintId) {
  const { data, error } = await supabase
    .from("sprint_user")
    .select("*", { count: "exact" })
    .eq("sprint_id", sprintId);

  if (error) throw new Error(error.message);

  return { data };
}

// * PROJECTS MANAGEMENT


export async function createProject(projectTitle) {
  const { data, error } = await supabase
    .from("project")
    .insert({ title: projectTitle })
    .single()
    .limit(1)
    .select();

  if (error) throw new Error(error.message);

  return { data };
}

export async function getProjects() {
  const { data, error } = await supabase
    .from("project")
    .select("*");

  if (error) throw new Error(error.message);

  return { data };
}

export async function getNameFromProjectId(projectId) {
  const { data, error } = await supabase
    .from("project")
    .select("title")
    .single()
    .limit(1)
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  return { data };
}

export async function getEmailFromLoggedInUser() {
  const session = await getSession();

  if (!session) return (window.location.href = "/");

  const userId = session.data.session.user.id;

  const { data, error } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .single()
    .limit(1);

  if (error) throw new Error(error.message);

  return { data: data.email };
} 