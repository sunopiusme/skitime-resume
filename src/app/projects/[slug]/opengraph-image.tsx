import { ImageResponse } from "next/og";

import { getProject, isProjectSlug } from "@/content/projects/registry";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isProjectSlug(slug)) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#f5f5f5",
            fontSize: 48,
          }}
        >
          Проект не найден
        </div>
      ),
      size,
    );
  }

  const project = getProject(slug);

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
          Данила Фурманов · Кейс
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: 110,
              lineHeight: 0.96,
              maxWidth: "1000px",
              letterSpacing: "-0.05em",
              fontWeight: 600,
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.3,
              maxWidth: "900px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {project.summary}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.08em",
          }}
        >
          skitime-resume.vercel.app/projects/{project.slug}
        </div>
      </div>
    ),
    size,
  );
}
