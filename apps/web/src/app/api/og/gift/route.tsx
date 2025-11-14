import Image from "next/image";
import { ImageResponse } from "next/og";
import { getCurrentEnsEnvironment } from "@/lib/ens-environments";
import { getArtistProfileServer } from "@/lib/get-artist-profile-server";
import { getGeistFonts } from "@/lib/og-fonts";
import { fetchImageWithTimeout, OgIdentifierSchema } from "@/lib/og-utils";
import { formatAddress, getTextRecord, ipfsToHttp } from "@/lib/utils";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawIdentifier = url.searchParams.get("identifier");

    // Validate identifier
    const validationResult = OgIdentifierSchema.safeParse(rawIdentifier);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid identifier",
          details: validationResult.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const identifier = validationResult.data;

    // Fetch profile data
    const profile = await getArtistProfileServer(identifier);

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract profile data
    const envConfig = getCurrentEnsEnvironment();
    const displayName =
      profile.subdomain?.name || formatAddress(profile.address);
    const rawAvatarUrl = getTextRecord(profile.textRecords, "avatar");

    const fullDomain = profile.subdomain
      ? `${profile.subdomain.name}.${envConfig.domain}`
      : formatAddress(profile.address);

    // Check avatar availability with timeout (2s max)
    const avatarHttpUrl = ipfsToHttp(rawAvatarUrl);
    const avatarUrl = await fetchImageWithTimeout(avatarHttpUrl);

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
            "radial-gradient(circle at 25% 25%, rgba(236, 72, 153, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
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
          {/* Gift icon */}
          <div
            style={{
              fontSize: 120,
              marginBottom: 30,
            }}
          >
            💝
          </div>

          {/* Main heading */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 20px 0",
              lineHeight: 1.2,
            }}
          >
            Send a tip to
          </h1>

          {/* Artist section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              marginBottom: 40,
            }}
          >
            {/* Avatar */}
            {avatarUrl ? (
              <Image
                alt={displayName}
                height={140}
                src={avatarUrl}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid rgba(236, 72, 153, 0.4)",
                }}
                width={140}
              />
            ) : (
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(236, 72, 153, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 70,
                  border: "4px solid rgba(236, 72, 153, 0.4)",
                }}
              >
                👤
              </div>
            )}

            {/* Name */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <h2
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                {displayName}
              </h2>
              <p
                style={{
                  fontSize: 28,
                  color: "rgba(255, 255, 255, 0.6)",
                  margin: 0,
                }}
              >
                {fullDomain}
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div
            style={{
              padding: "24px 48px",
              backgroundColor: "rgba(236, 72, 153, 0.15)",
              borderRadius: 16,
              border: "2px solid rgba(236, 72, 153, 0.3)",
            }}
          >
            <p
              style={{
                fontSize: 32,
                color: "rgba(255, 255, 255, 0.9)",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Support this artist on osopit
            </p>
          </div>

          {/* Bottom branding */}
          <div
            style={{
              position: "absolute",
              bottom: 60,
              left: 80,
              fontSize: 40,
              fontWeight: 700,
              background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            osopit
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts,
        headers: {
          // Cache for 24 hours at CDN and browser
          "Cache-Control": "public, immutable, max-age=86400, s-maxage=86400",
          "CDN-Cache-Control": "public, max-age=86400",
        },
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);

    // Differentiate between client errors (400s) and server errors (500s)
    const status =
      error instanceof Error && error.message.includes("not found") ? 404 : 500;

    return new Response(
      JSON.stringify({
        error: "Failed to generate OG image",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
          // Don't cache errors
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
