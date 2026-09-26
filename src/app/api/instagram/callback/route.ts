import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { esAdmin } from "@/lib/auth";
import { conectar } from "@/lib/instagram";

/** Vuelta de Instagram después de autorizar (o de cancelar). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const volver = (motivo?: string) =>
    NextResponse.redirect(
      new URL(motivo ? `/admin/instagram?error=${motivo}` : "/admin/instagram?conectado=1", request.url),
    );

  if (!(await esAdmin())) {
    return NextResponse.redirect(new URL("/ingresar?volver=/admin/instagram", request.url));
  }

  const almacen = await cookies();
  const esperado = almacen.get("ig_estado")?.value;
  almacen.set("ig_estado", "", { maxAge: 0, path: "/api/instagram" });

  if (url.searchParams.get("error")) return volver("cancelado");
  const codigo = url.searchParams.get("code");
  if (!codigo || !esperado || url.searchParams.get("state") !== esperado) return volver("vencido");

  try {
    await conectar(codigo);
  } catch (error) {
    console.error("[instagram] no se pudo conectar", error);
    return volver("conexion");
  }
  return volver();
}
