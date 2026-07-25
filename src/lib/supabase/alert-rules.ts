import { createClient } from "./client";
import { getOrCreateAssetId } from "./get-or-create-asset";

export type AlertCondition = "price_above" | "price_below";

export type AlertRule = {
  id: string;
  ticker: string;
  name: string;
  condition: AlertCondition;
  threshold: number;
};

function unwrapAsset(row: { assets: unknown }) {
  return Array.isArray(row.assets) ? row.assets[0] : row.assets;
}

export async function fetchAlertRules(): Promise<AlertRule[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("alert_rules")
    .select("id, condition, threshold, assets(ticker, name)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const asset = unwrapAsset(row) as { ticker: string; name: string } | undefined;
    return {
      id: row.id as string,
      ticker: asset?.ticker ?? "",
      name: asset?.name ?? "",
      condition: row.condition as AlertCondition,
      threshold: Number(row.threshold),
    };
  });
}

export async function createAlertRule(input: {
  ticker: string;
  name: string;
  condition: AlertCondition;
  threshold: number;
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("not_authenticated");

  const assetId = await getOrCreateAssetId(supabase, input.ticker, input.name);

  const { error } = await supabase.from("alert_rules").insert({
    user_id: userData.user.id,
    asset_id: assetId,
    condition: input.condition,
    threshold: input.threshold,
  });
  if (error) throw error;
}

export async function deleteAlertRule(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("alert_rules").delete().eq("id", id);
  if (error) throw error;
}
