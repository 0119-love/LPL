"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

function safeLocale(formData: FormData): string {
  const raw = formData.get("locale");
  return hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
}

export async function login(formData: FormData) {
  const locale = safeLocale(formData);
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
  const locale = safeLocale(formData);
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/${locale}/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/${locale}/dashboard`);
}
