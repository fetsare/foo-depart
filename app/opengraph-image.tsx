import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Foo Depart – Real-time Departures at Foo Bar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
          gap: "24px",
        }}
      >
        <div
          style={{
            fontSize: 80,
          }}
        >
          🚌
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-2px",
            textAlign: "center",
          }}
        >
          Foo Depart
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#60a5fa",
            textAlign: "center",
          }}
        >
          Real-time departures at Foo Bar
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Stockholm University · DISK
        </div>
      </div>
    ),
    size,
  );
}
