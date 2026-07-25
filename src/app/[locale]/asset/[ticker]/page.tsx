import { AssetDetailView } from "@/components/asset/asset-detail-view";

export default async function AssetPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  return <AssetDetailView ticker={decodeURIComponent(ticker).toUpperCase()} />;
}
