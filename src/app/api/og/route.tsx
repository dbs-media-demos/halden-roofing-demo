import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";

// Brand fonts + the photo panel are read once. Paths relative to this file are traced into the deployment.
const [display, mono, sans, photo] = await Promise.all([
  readFile(new URL("../../../assets/fonts/Archivo-Expanded-800.ttf", import.meta.url)),
  readFile(new URL("../../../assets/fonts/PlexMono-500.ttf", import.meta.url)),
  readFile(new URL("../../../assets/fonts/Manrope-500.ttf", import.meta.url)),
  readFile(new URL("../../../assets/og/og-photo.jpg", import.meta.url)),
]);
const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

/** Branded 1200×630 share image: /api/og?title=…&eyebrow=… */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Halden Roofing Co.").slice(0, 110).toUpperCase();
  const eyebrow = (searchParams.get("eyebrow") ?? "Fort Worth, TX · Since 1998").slice(0, 60).toUpperCase();
  const size = title.length > 60 ? 44 : title.length > 36 ? 54 : 66;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#0e1620", fontFamily: "Manrope" }}>
        {/* photo panel with a 6/12 gable top */}
        <div style={{ position: "absolute", right: 0, top: 0, width: 560, height: 630, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={photoSrc} width={560} height={630} style={{ objectFit: "cover" }} />
          <svg width="560" height="630" viewBox="0 0 560 630" style={{ position: "absolute", left: 0, top: 0 }}>
            <polygon points="0,0 280,0 0,140" fill="#0e1620" />
            <polygon points="560,0 280,0 560,140" fill="#0e1620" />
            <polygon points="0,140 280,0 560,140 560,150 280,10 0,150" fill="#c4713c" />
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, width: 620, height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="60" height="60" viewBox="0 0 64 64">
              <rect x="40.5" y="13" width="6" height="9" fill="#c4713c" />
              <path d="M6 31 L32 18 L58 31" fill="none" stroke="#f2eee7" strokeWidth="4.5" />
              <path d="M14 27 V56 M50 27 V56 M14 42 H50" fill="none" stroke="#f2eee7" strokeWidth="4.5" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "Archivo", fontSize: 30, color: "#f2eee7", letterSpacing: -1 }}>HALDEN</div>
              <div style={{ fontFamily: "Plex", fontSize: 13, color: "#a39f98", letterSpacing: 3 }}>ROOFING CO. · EST. 1998</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontFamily: "Plex", fontSize: 20, color: "#d98a52", letterSpacing: 3 }}>{eyebrow}</div>
            <div style={{ display: "flex", fontFamily: "Archivo", fontSize: size, lineHeight: 0.98, color: "#f2eee7", letterSpacing: -2 }}>{title}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#a39f98", fontSize: 22 }}>
            <div style={{ display: "flex", color: "#f2eee7" }}>Built for the next storm.</div>
            <div style={{ display: "flex", fontFamily: "Plex", fontSize: 18 }}>(817) 555-0142</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Archivo", data: display, weight: 800, style: "normal" },
        { name: "Plex", data: mono, weight: 500, style: "normal" },
        { name: "Manrope", data: sans, weight: 500, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
