import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
export async function getProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.log("Profile fetch failed:", error.message);
    return null;
  }

  return data;
}

export async function ensureProfile(user, roleFallback = "parent") {
  if (!user?.id) return { error: null, role: roleFallback };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: null, role: roleFallback };
  }

  const existing = await getProfile(user.id);
  const pendingRole = localStorage.getItem("pending_role");
  const role =
    pendingRole || existing?.role || user.user_metadata?.role || roleFallback;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role,
      email: user.email,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.log("Profile save failed:", error.message);
  }

  return { error, role };
}
