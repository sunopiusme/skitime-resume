import { ImageResponse } from "next/og";

import { siteConfig } from "@/design-system/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#f5f5f5",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 0.96,
              maxWidth: "1000px",
              letterSpacing: "-0.05em",
              fontWeight: 600,
            }}
          >
            Продуктовый и UI-дизайн с AI-native процессом.
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.3,
              maxWidth: "900px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Интерфейсы, прототипы и продуктовые системы в духе SwiftUI с 2019 года.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.55)" }}>{siteConfig.url}</div>
      </div>
    ),
    size,
  );
}
