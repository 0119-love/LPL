import { createClient } from "./client";
import { getOrCreateAssetId } from "./get-or-create-asset";

export type Holding = {
  id: string;
  assetId: string;
  ticker: string;
  name: string;
  quantity: number;
  avgCost: number;
};

export type Transaction = {
  id: string;
  ticker: string;
  name: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  executedAt: string;
};

export type Snapshot = {
  date: string;
  totalValue: number;
};

function unwrapAsset(row: { assets: unknown }) {
  return Array.isArray(row.assets) ? row.assets[0] : row.assets;
}

export async function fetchHoldings(): Promise<Holding[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select("id, asset_id, quantity, avg_cost, assets(ticker, name)")
    .order("updated_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const asset = unwrapAsset(row) as { ticker: string; name: string } | undefined;
    return {
      id: row.id as string,
      assetId: row.asset_id as string,
      ticker: asset?.ticker ?? "",
      name: asset?.name ?? "",
      quantity: Number(row.quantity),
      avgCost: Number(row.avg_cost),
    };
  });
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("portfolio_transactions")
    .select("id, side, quantity, price, executed_at, assets(ticker, name)")
    .order("executed_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const asset = unwrapAsset(row) as { ticker: string; name: string } | undefined;
    return {
      id: row.id as string,
      ticker: asset?.ticker ?? "",
      name: asset?.name ?? "",
      side: row.side as "buy" | "sell",
      quantity: Number(row.quantity),
      price: Number(row.price),
      executedAt: row.executed_at as string,
    };
  });
}

export async function recordTransaction(input: {
  ticker: string;
  name: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("not_authenticated");
  const userId = userData.user.id;

  const assetId = await getOrCreateAssetId(supabase, input.ticker, input.name);

  const { error: txError } = await supabase.from("portfolio_transactions").insert({
    user_id: userId,
    asset_id: assetId,
    side: input.side,
    quantity: input.quantity,
    price: input.price,
  });
  if (txError) throw txError;

  const { data: existing } = await supabase
    .from("portfolio_holdings")
    .select("quantity, avg_cost")
    .eq("user_id", userId)
    .eq("asset_id", assetId)
    .maybeSingle();

  const prevQty = existing ? Number(existing.quantity) : 0;
  const prevAvg = existing ? Number(existing.avg_cost) : 0;

  if (input.side === "buy") {
    const newQty = prevQty + input.quantity;
    const newAvg = (prevQty * prevAvg + input.quantity * input.price) / newQty;
    const { error } = await supabase
      .from("portfolio_holdings")
      .upsert(
        { user_id: userId, asset_id: assetId, quantity: newQty, avg_cost: newAvg, updated_at: new Date().toISOString() },
        { onConflict: "user_id,asset_id" },
      );
    if (error) throw error;
  } else {
    const newQty = Math.max(prevQty - input.quantity, 0);
    if (newQty === 0) {
      await supabase
        .from("portfolio_holdings")
        .delete()
        .eq("user_id", userId)
        .eq("asset_id", assetId);
    } else {
      const { error } = await supabase
        .from("portfolio_holdings")
        .upsert(
          { user_id: userId, asset_id: assetId, quantity: newQty, avg_cost: prevAvg, updated_at: new Date().toISOString() },
          { onConflict: "user_id,asset_id" },
        );
      if (error) throw error;
    }
  }
}

// PGRST205 = "table not found in schema cache" — the 0003 migration hasn't
// been applied (or PostgREST's cache hasn't refreshed) on this project yet.
// Degrade to "no history" instead of surfacing an error for something the
// user can't fix from inside the app.
function isMissingTable(error: { code?: string; message?: string } | null) {
  return error?.code === "PGRST205" || error?.message?.includes("schema cache");
}

export async function fetchSnapshots(): Promise<Snapshot[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("snapshot_date, total_value")
    .order("snapshot_date", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []).map((row) => ({
    date: row.snapshot_date as string,
    totalValue: Number(row.total_value),
  }));
}

export async function recordSnapshot(totalValue: number) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("portfolio_snapshots")
    .upsert(
      { user_id: userData.user.id, snapshot_date: today, total_value: totalValue },
      { onConflict: "user_id,snapshot_date" },
    );
  if (error && !isMissingTable(error)) {
    console.error("recordSnapshot failed:", error);
  }
}
