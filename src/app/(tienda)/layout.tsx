import { ProveedorCarrito } from "@/components/cart/carrito";
import { PanelCarrito } from "@/components/cart/panel-carrito";
import { Cabecera } from "@/components/site/cabecera";
import { BotonWhatsapp, Pie } from "@/components/site/pie";
import { getPerfil } from "@/lib/auth";
import { getAjustes, getCategorias } from "@/lib/db";
import { aNumero, ajuste, ajusteCrudo } from "@/lib/settings";
import { formatARS } from "@/lib/utils";

export default async function LayoutTienda({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ajustes, categorias, perfil] = await Promise.all([
    getAjustes(),
    getCategorias(),
    getPerfil(),
  ]);

  const envioGratisDesde = aNumero(ajustes.envio_gratis_desde);
  const aviso =
    envioGratisDesde > 0
      ? `Envío sin cargo en pedidos desde ${formatARS(envioGratisDesde)}`
      : null;

  return (
    <ProveedorCarrito>
      <div className="flex min-h-dvh flex-col">
        <Cabecera
          nombreMarca={ajuste(ajustes, "marca_nombre")}
          bajadaMarca={ajuste(ajustes, "marca_bajada")}
          logoUrl={ajusteCrudo(ajustes, "logo_url")}
          hayUsuario={Boolean(perfil)}
          esAdmin={Boolean(perfil?.is_admin)}
          aviso={aviso}
        />
        <main className="flex-1">{children}</main>
        <Pie ajustes={ajustes} categorias={categorias} />
      </div>
      <PanelCarrito />
      <BotonWhatsapp ajustes={ajustes} />
    </ProveedorCarrito>
  );
}
