/**
 * Tabla de productos. No tiene estado propio: muestra lo que recibe.
 * Props:
 *  - productos: lista a mostrar
 *  - onEditar(producto), onEliminar(codigo)
 */
function ProductoLista({ productos, onEditar, onEliminar }) {
  // Formato de pesos colombianos
  const pesos = (v) => '$' + Number(v).toLocaleString('es-CO');

  return (
    <div className="tarjeta lista">
      <h3>Productos registrados ({productos.length})</h3>
      {productos.length === 0 ? (
        <p className="vacio">No hay productos registrados</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Código</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              // key: identificador único que React usa para cada fila
              <tr key={p.codigo}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{pesos(p.precio)}</td>
                <td className={p.stock <= 5 ? 'bajo' : ''}>{p.stock}</td>
                <td>
                  <button onClick={() => onEditar(p)}>Editar</button>
                  <button className="peligro" onClick={() => onEliminar(p.codigo)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductoLista;
