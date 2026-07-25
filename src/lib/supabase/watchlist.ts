import { createClient } from "./client";

export type WatchlistItem = {
  watchlistId: string;
  assetId: string;
  ticker: string;
  name: string;
};

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("watchlist")
    .select("id, asset_id, assets(ticker, name)")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const asset = Array.isArray(row.assets) ? row.assets[0] : row.assets;
    return {
      watchlistId: row.id as string,
      assetId: row.asset_id as string,
      ticker: asset?.ticker ?? "",
      name: asset?.name ?? "",
    };
  });
}

export async function addToWatchlist(ticker: string, name: string) {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("not_authenticated");

  const { data: asset, error: upsertError } = await supabase
    .from("assets")
    .upsert({ ticker, name }, { onConflict: "ticker" })
    .select("id")
    .single();
  if (upsertError) throw upsertError;

  const { error: watchError } = await supabase
    .from("watchlist")
    .insert({ user_id: userData.user.id, asset_id: asset.id });
  if (watchError) throw watchError;
}

export async function removeFromWatchlist(watchlistId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("id", watchlistId);
  if (error) throw error;
}
