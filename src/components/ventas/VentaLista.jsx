import { useState } from 'react';
import Factura from './Factura.jsx';

/**
 * Historial de ventas (solo consulta).
 * Recibe también productos y clientes para mostrar nombres en vez de ids.
 * Estado propio: ventaFactura (venta cuya factura se está viendo, o null)
 * Props: ventas, productos, clientes
 */
function VentaLista({ ventas, productos, clientes }) {
  const [ventaFactura, setVentaFactura] = useState(null);

  const buscarProducto = (cod) => productos.find((p) => p.codigo === cod);
  const buscarCliente = (id) => clientes.find((c) => c.id === id);

  // Suma de todas las ventas con reduce
  const totalGeneral = ventas.reduce((suma, v) => suma + v.total, 0);

  return (
    <div className="tarjeta lista">
      <h3>Historial de ventas ({ventas.length})</h3>
      {ventas.length === 0 ? (
        <p className="vacio">Aún no hay ventas registradas</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>#</th><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cant.</th><th>Total</th><th>Factura</th>
              </tr>
            </thead>
            <tbody>
              {/* Se muestran de la más reciente a la más antigua */}
              {[...ventas].reverse().map((v) => (
                <tr key={v.idVenta}>
                  <td>{v.idVenta}</td>
                  <td>{v.fecha}</td>
                  <td>{buscarCliente(v.idCliente)?.nombre || 'Eliminado'}</td>
                  <td>{buscarProducto(v.codigoProducto)?.nombre || 'Eliminado'}</td>
                  <td>{v.cantidad}</td>
                  <td>${v.total.toLocaleString('es-CO')}</td>
                  <td>
                    <button onClick={() => setVentaFactura(v)}>Ver factura</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="total-general">Total vendido: <strong>${totalGeneral.toLocaleString('es-CO')}</strong></p>
        </>
      )}

      {/* Renderizado condicional: la factura solo aparece si hay una venta seleccionada */}
      {ventaFactura && (
        <Factura
          venta={ventaFactura}
          producto={buscarProducto(ventaFactura.codigoProducto)}
          cliente={buscarCliente(ventaFactura.idCliente)}
          onCerrar={() => setVentaFactura(null)}
        />
      )}
    </div>
  );
}

export default VentaLista;
