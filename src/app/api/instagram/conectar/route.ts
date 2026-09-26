import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { esAdmin } from "@/lib/auth";
import { instagramConfigurado, urlDeAutorizacion } from "@/lib/instagram";

/** Manda a Instagram para que Silvina autorice leer sus publicaciones. */
export async function GET(request: Request) {
  if (!(await esAdmin())) {
    return NextResponse.redirect(new URL("/ingresar?volver=/admin/instagram", request.url));
  }
  if (!instagramConfigurado()) {
    return NextResponse.redirect(new URL("/admin/instagram?error=configuracion", request.url));
  }

  // Código de un solo uso: a la vuelta tiene que coincidir.
  const estado = crypto.randomUUID();
  (await cookies()).set("ig_estado", estado, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/api/instagram",
  });
  return NextResponse.redirect(urlDeAutorizacion(estado));
}
