import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CheatSheet — Developer Command Reference";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* top radial glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />

        {/* badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: 999,
            padding: "8px 20px",
            color: "#a5b4fc",
            fontSize: 18,
            marginBottom: 28,
          }}
        >
          &gt;_ Developer Command Reference
        </div>

        {/* title */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: "#f4f4f5",
            letterSpacing: "-3px",
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          CheatSheet
        </div>

        {/* subtitle */}
        <div
          style={{
            fontSize: 26,
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: 780,
            lineHeight: 1.5,
          }}
        >
          Bash · Git · Docker · Kubernetes · Python · SQL · Regex · and more
        </div>

        {/* bottom credit */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            color: "#3f3f46",
            fontSize: 16,
          }}
        >
          simeonivanov.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
