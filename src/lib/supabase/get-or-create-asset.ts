import type { SupabaseClient } from "@supabase/supabase-js";

// Inserts the ticker if it's new (ignoring the conflict if someone else
// already added it — assets has no UPDATE policy, only INSERT), then always
// reads the row back so callers get an id regardless of which branch ran.
export async function getOrCreateAssetId(
  supabase: SupabaseClient,
  ticker: string,
  name: string,
): Promise<string> {
  await supabase
    .from("assets")
    .upsert({ ticker, name }, { onConflict: "ticker", ignoreDuplicates: true });

  const { data, error } = await supabase
    .from("assets")
    .select("id")
    .eq("ticker", ticker)
    .single();

  if (error || !data) {
    throw error ?? new Error("asset_not_found");
  }
  return data.id as string;
}
