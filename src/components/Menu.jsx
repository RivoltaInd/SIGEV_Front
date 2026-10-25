/**
 * Menú de navegación entre módulos.
 * Props:
 *  - moduloActivo: módulo que está seleccionado
 *  - onCambiar(modulo): función que avisa a App el módulo elegido
 */
function Menu({ moduloActivo, onCambiar }) {
  const opciones = [
    { id: 'productos', texto: 'Productos' },
    { id: 'clientes', texto: 'Clientes' },
    { id: 'ventas', texto: 'Ventas' }
  ];

  return (
    <nav className="menu">
      {opciones.map((op) => (
        <button
          key={op.id}
          // Se resalta la opción activa con la clase "activo"
          className={moduloActivo === op.id ? 'activo' : ''}
          onClick={() => onCambiar(op.id)}
        >
          {op.texto}
        </button>
      ))}
    </nav>
  );
}

export default Menu;
