import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#059669",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 96,
          letterSpacing: "-0.04em",
          transform: "rotate(-6deg)",
        }}
      >
        VU
      </div>
    ),
    { ...size },
  );
}
