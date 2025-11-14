import Image from "next/image";
import { ImageResponse } from "next/og";
import { getCurrentEnsEnvironment } from "@/lib/ens-environments";
import { getArtistProfileServer } from "@/lib/get-artist-profile-server";
import { getGeistFonts } from "@/lib/og-fonts";
import {
  fetchImageWithTimeout,
  OgIdentifierSchema,
  parseBroadcast,
  truncateText,
} from "@/lib/og-utils";
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
    const bio = getTextRecord(profile.textRecords, "description") || "";
    const truncatedBio = truncateText(bio, 150);
    const rawAvatarUrl = getTextRecord(profile.textRecords, "avatar");
    const broadcastValue = getTextRecord(
      profile.textRecords,
      "app.osopit.broadcast"
    );
    const broadcast = parseBroadcast(broadcastValue);

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
            "radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)",
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
            justifyContent: "space-between",
          }}
        >
          {/* Top section with avatar and info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 40 }}>
            {/* Avatar */}
            {avatarUrl ? (
              <Image
                alt={displayName}
                height={180}
                src={avatarUrl}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid rgba(139, 92, 246, 0.3)",
                }}
                width={180}
              />
            ) : (
              <div
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 80,
                  border: "4px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                👤
              </div>
            )}

            {/* Name and domain */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                flex: 1,
              }}
            >
              <h1
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {displayName}
              </h1>
              <p
                style={{
                  fontSize: 32,
                  color: "rgba(255, 255, 255, 0.6)",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {fullDomain}
              </p>

              {/* Live indicator */}
              {broadcast.isLive && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginTop: 20,
                    padding: "16px 28px",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    borderRadius: 12,
                    border: "2px solid rgba(239, 68, 68, 0.4)",
                    width: "fit-content",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#ef4444",
                      boxShadow: "0 0 20px rgba(239, 68, 68, 0.8)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 600,
                      color: "#ef4444",
                      letterSpacing: "0.05em",
                    }}
                  >
                    LIVE
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {truncatedBio && (
            <p
              style={{
                fontSize: 36,
                color: "rgba(255, 255, 255, 0.8)",
                margin: "40px 0",
                lineHeight: 1.5,
                maxHeight: "180px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {truncatedBio}
            </p>
          )}

          {/* Bottom branding */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              osopit
            </div>
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
