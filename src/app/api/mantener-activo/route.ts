import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Vercel la llama una vez por día (ver `crons` en vercel.json). Supabase pausa
 * los proyectos gratis después de 7 días sin consultas: con esto no pasa nunca,
 * aunque la tienda esté quieta. Solo cuenta filas, no lee ni escribe datos.
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
  return NextResponse.json({ ok: !error, ajustes: count ?? 0 });
}
