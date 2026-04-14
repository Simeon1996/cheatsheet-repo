import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Explore Developer Cheatsheets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORIES = [
  "Bash", "Git", "Docker", "Kubernetes", "Python",
  "SQL", "Regex", "Redis", "Terraform", "Ansible",
  "AWS CLI", "OWASP", "MCP", "Claude Code", "React",
];

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
        {/* top glow */}
        <div
          style={{
            position: "absolute",
            top: -150,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.16) 0%, transparent 70%)",
          }}
        />

        {/* eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: 999,
            padding: "7px 18px",
            color: "#a5b4fc",
            fontSize: 16,
            marginBottom: 24,
          }}
        >
          ReferentialSheet
        </div>

        {/* title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#f4f4f5",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 20,
          }}
        >
          Explore Cheatsheets
        </div>

        {/* subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "#71717a",
            marginBottom: 44,
          }}
        >
          Syntax-highlighted · Copy-ready · Always free
        </div>

        {/* category pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            maxWidth: 900,
          }}
        >
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 8,
                padding: "6px 14px",
                color: "#a1a1aa",
                fontSize: 15,
              }}
            >
              {cat}
            </div>
          ))}
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
