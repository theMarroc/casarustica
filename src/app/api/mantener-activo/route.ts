import { NextResponse } from "next/server";

import { renovarSiHaceFalta } from "@/lib/instagram";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Vercel la llama una vez por día (ver `crons` en vercel.json). Supabase pausa
 * los proyectos gratis después de 7 días sin consultas: con esto no pasa nunca,
 * aunque la tienda esté quieta. Solo cuenta filas, no lee ni escribe datos.
 * De paso renueva el permiso de Instagram antes de que venza.
 */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (secreto && request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, motivo: "sin base de datos" });
  }

  const { count, error } = await createAdminClient()
    .from("settings")
    .select("key", { count: "exact", head: true });

  if (error) console.error("[mantener activo] la consulta falló", error.message);

  let instagram: string;
  try {
    instagram = await renovarSiHaceFalta();
  } catch (fallo) {
    console.error("[mantener activo] no se pudo renovar Instagram", fallo);
    instagram = "error al renovar";
  }

  return NextResponse.json({ ok: !error, ajustes: count ?? 0, instagram });
}
