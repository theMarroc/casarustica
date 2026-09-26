// Migración desde el archivo que se descarga de Instagram ("Descargar tu información").
// Carga cada publicación con fotos como borrador pendiente en el panel (Desde Instagram),
// para que Silvina decida qué es cada una. Si se corre de nuevo, saltea lo que ya cargó.
//
//   node scripts/importar-instagram.mjs <archivo.zip o carpeta descomprimida> [--probar]
//
// --probar solo lee el archivo y muestra qué encontró, sin subir nada.
// Usa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY de .env.local.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";

const [entrada, ...opciones] = process.argv.slice(2);
const soloProbar = opciones.includes("--probar");
if (!entrada || !existsSync(entrada)) {
  console.error("Uso: node scripts/importar-instagram.mjs <archivo.zip o carpeta> [--probar]");
  process.exit(1);
}

const TIPOS = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

// --- El archivo ------------------------------------------------------------
let raiz = entrada;
if (statSync(entrada).isFile()) {
  raiz = mkdtempSync(join(tmpdir(), "instagram-"));
  console.log(`Descomprimiendo en ${raiz}...`);
  // En Windows, el tar del sistema abre ZIP (el de Git Bash no); en el resto, unzip.
  if (process.platform === "win32") {
    const tar = join(process.env.SystemRoot ?? "C:/Windows", "System32", "tar.exe");
    execFileSync(tar, ["-xf", entrada, "-C", raiz]);
  } else {
    execFileSync("unzip", ["-q", entrada, "-d", raiz]);
  }
}

function buscar(carpeta, patron, encontrados = []) {
  for (const nombre of readdirSync(carpeta)) {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) buscar(ruta, patron, encontrados);
    else if (patron.test(nombre)) encontrados.push(ruta);
  }
  return encontrados;
}

const archivosPosts = buscar(raiz, /^posts_\d+\.json$/);
if (archivosPosts.length === 0) {
  console.error(
    "No encontramos posts_1.json. Al pedir la descarga en Instagram hay que elegir formato JSON.",
  );
  process.exit(1);
}

/** Instagram guarda los textos con la codificación rota: "Ã±" en vez de "ñ". */
function arreglar(texto) {
  if (!texto) return "";
  if ([...texto].some((c) => c.charCodeAt(0) > 0xff) || !/[\u0080-ÿ]/.test(texto)) return texto;
  return Buffer.from(texto, "latin1").toString("utf8");
}

/** La ruta de cada foto es relativa a la raíz del archivo (a veces a una carpeta de más). */
function rutaLocal(uri) {
  const directa = join(raiz, uri);
  if (existsSync(directa)) return directa;
  for (const carpeta of readdirSync(raiz)) {
    const anidada = join(raiz, carpeta, uri);
    if (existsSync(anidada)) return anidada;
  }
  return null;
}

const publicaciones = archivosPosts
  .flatMap((archivo) => {
    const datos = JSON.parse(readFileSync(archivo, "utf8"));
    return Array.isArray(datos) ? datos : Object.values(datos).find(Array.isArray) ?? [];
  })
  .map((post) => {
    const medios = Array.isArray(post.media) ? post.media : [];
    const fotos = medios
      .map((m) => m.uri)
      .filter((uri) => uri && TIPOS[extname(uri).toLowerCase()]);
    return {
      texto: arreglar(post.title ?? medios[0]?.title ?? ""),
      fecha: post.creation_timestamp ?? medios[0]?.creation_timestamp ?? null,
      referencia: medios[0]?.uri ?? null,
      fotos,
    };
  })
  .filter((p) => p.referencia);

const conFotos = publicaciones.filter((p) => p.fotos.length > 0);
console.log(
  `Encontramos ${publicaciones.length} publicaciones: ${conFotos.length} con fotos y ` +
    `${publicaciones.length - conFotos.length} solo con video (esas no se cargan).`,
);

if (soloProbar) {
  for (const p of conFotos.slice(0, 5)) {
    const dia = p.fecha ? new Date(p.fecha * 1000).toLocaleDateString("es-AR") : "sin fecha";
    console.log(`\n- ${dia}, ${p.fotos.length} foto(s)\n  ${p.texto.slice(0, 140).replace(/\n/g, " / ")}`);
  }
  process.exit(0);
}

// --- La base ---------------------------------------------------------------
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !CLAVE) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.");
  process.exit(1);
}
const cabeceras = { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` };

const existentes = await (
  await fetch(`${URL_BASE}/rest/v1/social_imports?source=eq.archivo&select=source_ref`, {
    headers: cabeceras,
  })
).json();
const yaCargadas = new Set(existentes.map((f) => f.source_ref));

let cargadas = 0;
let salteadas = 0;
let fotosSubidas = 0;
for (const [indice, p] of conFotos.entries()) {
  if (yaCargadas.has(p.referencia)) {
    salteadas += 1;
    continue;
  }

  const urls = [];
  for (const uri of p.fotos) {
    const local = rutaLocal(uri);
    if (!local) {
      console.warn(`  No encontramos ${uri} en el archivo; la salteamos.`);
      continue;
    }
    const mes = p.fecha ? new Date(p.fecha * 1000).toISOString().slice(0, 7) : "sin-fecha";
    const destino = `instagram/archivo/${mes}/${basename(uri)}`;
    const respuesta = await fetch(`${URL_BASE}/storage/v1/object/productos/${destino}`, {
      method: "POST",
      headers: { ...cabeceras, "Content-Type": TIPOS[extname(uri).toLowerCase()], "x-upsert": "true" },
      body: readFileSync(local),
    });
    if (!respuesta.ok) {
      console.warn(`  No se pudo subir ${uri}: ${respuesta.status}`);
      continue;
    }
    urls.push(`${URL_BASE}/storage/v1/object/public/productos/${destino}`);
    fotosSubidas += 1;
  }
  if (urls.length === 0) continue;

  const respuesta = await fetch(`${URL_BASE}/rest/v1/social_imports?on_conflict=source_ref`, {
    method: "POST",
    headers: {
      ...cabeceras,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      source: "archivo",
      source_ref: p.referencia,
      caption: p.texto || null,
      taken_at: p.fecha ? new Date(p.fecha * 1000).toISOString() : null,
      images: urls,
      status: "pendiente",
    }),
  });
  if (!respuesta.ok) {
    console.warn(`  No se pudo guardar la publicación ${p.referencia}: ${await respuesta.text()}`);
    continue;
  }
  cargadas += 1;
  if ((indice + 1) % 10 === 0) console.log(`  ${indice + 1} de ${conFotos.length}...`);
}

console.log(
  `\nListo: ${cargadas} publicaciones cargadas (${fotosSubidas} fotos), ` +
    `${salteadas} que ya estaban. Aparecen en el panel, en Desde Instagram.`,
);
