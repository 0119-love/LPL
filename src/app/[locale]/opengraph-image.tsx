import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Common" });
  const tHero = await getTranslations({ locale, namespace: "Hero" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(1200px 700px at 15% -10%, rgba(61,220,132,0.16), transparent 60%), radial-gradient(1000px 700px at 100% 0%, rgba(76,154,255,0.14), transparent 55%), #0a0a0b",
          color: "#f5f5f4",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#f5f5f4",
              color: "#0a0a0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            V
          </div>
          <span style={{ fontSize: 32, fontWeight: 700 }}>{t("brand")}</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: 980,
            whiteSpace: "pre-wrap",
          }}
        >
          {tHero("title")}
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: "#9a9a9e" }}>
          {t("brandTag")}
        </div>
      </div>
    ),
    { ...size },
  );
}
