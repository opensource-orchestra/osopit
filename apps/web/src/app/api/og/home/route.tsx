import { ImageResponse } from "next/og";
import { getGeistFonts } from "@/lib/og-fonts";

export const runtime = "edge";

export async function GET() {
  try {
    // Load fonts (cached after first request)
    const fonts = await getGeistFonts();

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.08) 0%, transparent 60%)",
          padding: "80px",
          fontFamily: "Geist, sans-serif",
        }}
      >
        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Logo/brand */}
          <div
            style={{
              fontSize: 140,
              fontWeight: 700,
              background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 40,
              letterSpacing: "-0.02em",
            }}
          >
            osopit
          </div>

          {/* Tagline */}
          <h1
            style={{
              fontSize: 52,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
              margin: "0 0 24px 0",
              lineHeight: 1.3,
              maxWidth: "900px",
            }}
          >
            Live streaming platform for artists
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 36,
              color: "rgba(255, 255, 255, 0.6)",
              margin: 0,
              lineHeight: 1.5,
              maxWidth: "800px",
            }}
          >
            Connect with creators, support artists, and experience live
            performances
          </p>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 60,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 28px",
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                borderRadius: 12,
                border: "2px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <span style={{ fontSize: 32 }}>🎵</span>
              <span
                style={{
                  fontSize: 28,
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                }}
              >
                Live Streams
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 28px",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                borderRadius: 12,
                border: "2px solid rgba(99, 102, 241, 0.2)",
              }}
            >
              <span style={{ fontSize: 32 }}>👥</span>
              <span
                style={{
                  fontSize: 28,
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                }}
              >
                Artist Profiles
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 28px",
                backgroundColor: "rgba(236, 72, 153, 0.1)",
                borderRadius: 12,
                border: "2px solid rgba(236, 72, 153, 0.2)",
              }}
            >
              <span style={{ fontSize: 32 }}>💝</span>
              <span
                style={{
                  fontSize: 28,
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: 500,
                }}
              >
                Support Artists
              </span>
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts,
        headers: {
          // Cache for 24 hours at CDN and browser (static image)
          "Cache-Control": "public, immutable, max-age=86400, s-maxage=86400",
          "CDN-Cache-Control": "public, max-age=86400",
        },
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate OG image",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          // Don't cache errors
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
