import { useState } from 'react';

/**
 * Formulario para registrar una venta.
 * Calcula el total en pantalla y no deja vender más que el stock.
 * Props: productos, clientes, onRegistrar(venta)
 */
function VentaForm({ productos, clientes, onRegistrar }) {
  const [idCliente, setIdCliente] = useState('');
  const [codigoProducto, setCodigoProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState('');

  // Producto seleccionado (para mostrar precio, stock y total)
  const producto = productos.find((p) => p.codigo === Number(codigoProducto));
  const total = producto ? producto.precio * Number(cantidad || 0) : 0;

  const manejarEnvio = (e) => {
    e.preventDefault();
    const cant = Number(cantidad);

    // Validaciones (las mismas de las pruebas VAL de AA3)
    if (!idCliente) return setError('Debe seleccionar un cliente');
    if (!producto) return setError('Debe seleccionar un producto');
    if (!Number.isInteger(cant) || cant <= 0) return setError('La cantidad debe ser un entero mayor a 0');
    if (cant > producto.stock) return setError(`Stock insuficiente. Disponible: ${producto.stock}`);

    setError('');
    onRegistrar({
      idCliente: Number(idCliente),
      codigoProducto: producto.codigo,
      cantidad: cant
    });
    // Limpia el formulario
    setCodigoProducto('');
    setCantidad(1);
  };

  return (
    <form className="tarjeta formulario" onSubmit={manejarEnvio} noValidate>
      <h3>Nueva venta</h3>

      <label>Cliente</label>
      <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)}>
        <option value="">-- Seleccione --</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre} ({c.documento})</option>
        ))}
      </select>

      <label>Producto</label>
      <select value={codigoProducto} onChange={(e) => setCodigoProducto(e.target.value)}>
        <option value="">-- Seleccione --</option>
        {productos.map((p) => (
          // Los productos sin stock aparecen deshabilitados
          <option key={p.codigo} value={p.codigo} disabled={p.stock === 0}>
            {p.nombre} - stock {p.stock}
          </option>
        ))}
      </select>

      <label>Cantidad</label>
      <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />

      {producto && (
        <div className="resumen">
          <span>Precio: ${producto.precio.toLocaleString('es-CO')}</span>
          <strong>Total: ${total.toLocaleString('es-CO')}</strong>
        </div>
      )}

      {error && <small className="error">{error}</small>}

      <div className="acciones">
        <button type="submit" className="primario">Registrar venta</button>
      </div>
    </form>
  );
}

export default VentaForm;
