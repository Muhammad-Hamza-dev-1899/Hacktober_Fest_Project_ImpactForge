import { ImageResponse } from "next/og";

export const alt = "ImpactForge: turn one sentence into a movement";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "radial-gradient(80% 90% at 50% 0%, rgba(255,106,61,0.45), rgba(255,61,119,0.15) 45%, #09080b 75%)",
        backgroundColor: "#09080b",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #ffd18a, #ff6a3d, #ff3d77)",
          }}
        />
        ImpactForge
      </div>
      <div style={{ marginTop: 56, fontSize: 92, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>Turn one sentence</div>
      <div
        style={{
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: -4,
          lineHeight: 1.05,
          backgroundImage: "linear-gradient(95deg, #ffd18a, #ff8a4c 35%, #ff4d6d 70%, #ff3d9a)",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        into a movement.
      </div>
      <div style={{ marginTop: 40, fontSize: 30, color: "rgba(255,255,255,0.6)" }}>
        AI campaigns for student causes · Wrapped-style impact stories · Open source
      </div>
    </div>,
    size,
  );
}
