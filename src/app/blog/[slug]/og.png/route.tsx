import { ImageResponse } from "next/og";
import { formatDate, getPost, postParams } from "@/lib/blog";
import { site } from "@/lib/content";
import { ogFonts } from "@/lib/og-fonts";

// Per-article link preview (LinkedIn, X, Slack), rendered at build time.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return postParams();
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  const long = post.title.length > 60;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(circle at 88% 18%, #1a1917 0%, #07070a 52%)",
          color: "#ece8e0",
          overflow: "hidden",
        }}
      >
        {/* A thin crescent in the corner, same construction as the homepage card. */}
        <div
          style={{
            position: "absolute",
            left: 930,
            top: -90,
            width: 360,
            height: 360,
            borderRadius: 360,
            background: "radial-gradient(circle at 68% 42%, #f4f0e8 0%, #cfc9bd 30%, #8d887e 62%, #3b3935 100%)",
            boxShadow: "0 0 110px rgba(255, 214, 176, 0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 862,
            top: -104,
            width: 378,
            height: 378,
            borderRadius: 378,
            background: "radial-gradient(circle at 50% 50%, #0b0b0e 0%, #0b0b0e 66%, rgba(11, 11, 14, 0) 71%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: "Geist Mono",
              fontSize: 20,
              letterSpacing: 3,
              color: "#8d897f",
            }}
          >
            <div style={{ width: 11, height: 11, borderRadius: 11, background: "#ff6a2b" }} />
            {`WRITING · ${formatDate(post.date).toUpperCase()} · ${post.minutes} MIN READ`}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Instrument Serif",
              fontSize: long ? 78 : 96,
              lineHeight: 1.02,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {post.title}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Geist Mono",
              fontSize: 19,
              letterSpacing: 2,
              color: "#8d897f",
            }}
          >
            <span style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 34, letterSpacing: 0, color: "#bab5aa" }}>
              {site.name}
            </span>
            <span style={{ display: "flex", alignItems: "flex-end" }}>{`${site.url.replace("https://", "")}/blog`}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await ogFonts() },
  );
}
