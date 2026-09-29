import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/content";

// Social preview card, served at /og.png so static hosts send the right content type.
export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

const fonts = join(process.cwd(), "node_modules/@fontsource");

export async function GET() {
  const [serif, serifItalic, mono] = await Promise.all([
    readFile(join(fonts, "instrument-serif/files/instrument-serif-latin-400-normal.woff")),
    readFile(join(fonts, "instrument-serif/files/instrument-serif-latin-400-italic.woff")),
    readFile(join(fonts, "geist-mono/files/geist-mono-latin-400-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(circle at 78% 45%, #1a1917 0%, #07070a 58%)",
          color: "#ece8e0",
          overflow: "hidden",
        }}
      >
        {/* Moon: lit disc, then the night side laid over it to leave a crescent. */}
        <div
          style={{
            position: "absolute",
            left: 720,
            top: 50,
            width: 540,
            height: 540,
            borderRadius: 540,
            background: "radial-gradient(circle at 68% 42%, #f4f0e8 0%, #cfc9bd 30%, #8d887e 62%, #3b3935 100%)",
            boxShadow: "0 0 140px rgba(255, 214, 176, 0.28)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 612,
            top: 38,
            width: 564,
            height: 564,
            borderRadius: 564,
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
            AI ENGINEER · RESEARCHER · BUILDER
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Instrument Serif", fontSize: 176, lineHeight: 0.9, letterSpacing: -6 }}>
              {site.firstName}
            </div>
            <div
              style={{
                fontFamily: "Instrument Serif",
                fontStyle: "italic",
                fontSize: 108,
                lineHeight: 1,
                letterSpacing: -3,
                color: "#bab5aa",
              }}
            >
              {site.lastName}
            </div>
            <div style={{ fontFamily: "Instrument Serif", fontSize: 36, marginTop: 28, maxWidth: 640, lineHeight: 1.2 }}>
              {site.tagline}
            </div>
          </div>

          <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 19, letterSpacing: 2, color: "#8d897f" }}>
            {site.url.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Instrument Serif", data: serifItalic, style: "italic", weight: 400 },
        { name: "Geist Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
