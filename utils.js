import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js";

const supabase = createClient(
  "https://yzdfjptxgcgsowohlmlf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGZqcHR4Z2Nnc293b2hsbWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk3MDk5NTgsImV4cCI6MjAwNTI4NTk1OH0.1zpNEFGKehpPwfd39BvyYvAHua6k-feb6b5LyD6MQLE"
);

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return { data };
}

export async function register(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return { data };
}

export async function getCards() {
  const { data: session } = await getSession();

  if (!session) throw new Error("You are not logged in!");

  const { error, data } = await supabase.from("card").select();

  if (error) throw new Error(error.message);

  return { data };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw new Error(error.message);

  return { data };
}
