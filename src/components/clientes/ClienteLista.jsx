import { useState } from 'react';

/**
 * Tabla de clientes con buscador.
 * Estado propio: filtro (texto que escribe el usuario).
 * Props: clientes, onEditar(cliente), onEliminar(id)
 */
function ClienteLista({ clientes, onEditar, onEliminar }) {
  const [filtro, setFiltro] = useState('');

  // Filtra por nombre o documento sin modificar la lista original
  const texto = filtro.toLowerCase();
  const filtrados = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(texto) || c.documento.includes(texto)
  );

  return (
    <div className="tarjeta lista">
      <h3>Clientes registrados ({clientes.length})</h3>
      <input
        className="buscador"
        placeholder="Buscar por nombre o documento..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
      {filtrados.length === 0 ? (
        <p className="vacio">No se encontraron clientes</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Documento</th><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id}>
                <td>{c.documento}</td>
                <td>{c.nombre}</td>
                <td>{c.telefono || '—'}</td>
                <td>{c.correo || '—'}</td>
                <td>
                  <button onClick={() => onEditar(c)}>Editar</button>
                  <button className="peligro" onClick={() => onEliminar(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ClienteLista;
