import { ImageResponse } from "next/og";

import { getAjustes } from "@/lib/db";
import { ajuste } from "@/lib/settings";

// La tarjeta que se ve al compartir el link por WhatsApp o redes.
export const alt = "Casa Rústica, deco hogar y arte hecho a mano";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const ajustes = await getAjustes();
  const nombre = ajuste(ajustes, "marca_nombre");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#efe6da",
          color: "#5a4636",
          border: "18px solid #faf7f2",
        }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 32 32"
          fill="none"
          stroke="#a67c52"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.5 15.5 16 5.5l11.5 10" />
          <path d="M21.5 9.5V6.3h2.8v5.6" />
          <path d="M8 13v13.5h16V13" />
          <path d="M13.5 26.5v-5a2.5 2.5 0 0 1 5 0v5" />
        </svg>
        <div style={{ marginTop: 28, fontSize: 92, letterSpacing: 6, textTransform: "uppercase" }}>
          {nombre}
        </div>
        <div style={{ marginTop: 18, width: 120, height: 2, background: "#bfa98f" }} />
        <div style={{ marginTop: 26, fontSize: 36, color: "#6b665f" }}>
          Deco hogar y arte hecho a mano · Miramar
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 24,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#46698c",
          }}
        >
          Tienda · Servicios · Taller de arte
        </div>
      </div>
    ),
    size,
  );
}
