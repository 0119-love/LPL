"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const locale = String(formData.get("locale"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/${locale}/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/dashboard`);
}

export async function signup(formData: FormData) {
  const locale = String(formData.get("locale"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/${locale}/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/dashboard`);
}
