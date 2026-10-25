/**
 * Factura de venta (comprobante imprimible).
 * Se abre como ventana emergente desde el historial de ventas.
 * Props:
 *  - venta: la venta a mostrar
 *  - producto: producto vendido (puede ser undefined si se eliminó)
 *  - cliente: cliente de la venta (puede ser undefined si se eliminó)
 *  - onCerrar(): cierra la factura
 *
 * Nota: los precios de SIGEV incluyen IVA, así que el IVA (19%)
 * se calcula sacándolo del total: subtotal = total / 1.19
 */
const IVA = 0.19;

function Factura({ venta, producto, cliente, onCerrar }) {
  const pesos = (v) => '$' + Math.round(v).toLocaleString('es-CO');

  // Cálculos de la factura
  const valorUnitario = venta.total / venta.cantidad;
  const subtotal = venta.total / (1 + IVA);
  const valorIva = venta.total - subtotal;

  // Número de factura con ceros a la izquierda: FV-000001
  const numero = 'FV-' + String(venta.idVenta).padStart(6, '0');

  // window.print() abre el diálogo de impresión del navegador
  // (desde ahí también se puede guardar como PDF)
  const imprimir = () => window.print();

  return (
    // Fondo oscuro: al hacer clic afuera se cierra
    <div className="factura-fondo" onClick={onCerrar}>
      {/* stopPropagation evita que el clic dentro de la factura la cierre */}
      <div className="factura" onClick={(e) => e.stopPropagation()}>
        <header className="factura-encabezado">
          <div>
            <img src="/logo.png" alt="SIGEV" className="factura-logo" />
            <p>Ferretería · Cali, Colombia</p>
          </div>
          <div className="factura-numero">
            <strong>FACTURA DE VENTA</strong>
            <span>{numero}</span>
            <span>Fecha: {venta.fecha}</span>
          </div>
        </header>

        <section className="factura-cliente">
          <h4>Cliente</h4>
          <p><strong>{cliente?.nombre || 'Cliente eliminado'}</strong></p>
          {cliente && (
            <>
              <p>Documento: {cliente.documento}</p>
              {cliente.telefono && <p>Teléfono: {cliente.telefono}</p>}
              {cliente.correo && <p>Correo: {cliente.correo}</p>}
            </>
          )}
        </section>

        <table className="factura-tabla">
          <thead>
            <tr>
              <th>Producto</th><th>Cant.</th><th>Valor unit.</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{producto?.nombre || 'Producto eliminado'}</td>
              <td>{venta.cantidad}</td>
              <td>{pesos(valorUnitario)}</td>
              <td>{pesos(venta.total)}</td>
            </tr>
          </tbody>
        </table>

        <div className="factura-totales">
          <p><span>Subtotal</span><span>{pesos(subtotal)}</span></p>
          <p><span>IVA (19%)</span><span>{pesos(valorIva)}</span></p>
          <p className="factura-total"><span>TOTAL A PAGAR</span><span>{pesos(venta.total)}</span></p>
        </div>

        <p className="factura-nota">
          Documento generado por SIGEV. No es factura electrónica DIAN.
        </p>

        {/* Los botones no salen al imprimir (clase no-imprimir) */}
        <div className="acciones no-imprimir">
          <button className="primario" onClick={imprimir}>Imprimir / Guardar PDF</button>
          <button onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default Factura;
