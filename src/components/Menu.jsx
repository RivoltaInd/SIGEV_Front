import { puede, MODULOS } from '../permisos.js';

/**
 * Menú de navegación entre módulos.
 * Los módulos que el rol no puede abrir se muestran con candado;
 * si los abre, App muestra la página 403.
 * Props:
 *  - usuario: usuario conectado (para saber su rol)
 *  - moduloActivo: módulo que está seleccionado
 *  - onCambiar(modulo): función que avisa a App el módulo elegido
 */
function Menu({ usuario, moduloActivo, onCambiar }) {
  return (
    <nav className="menu">
      {Object.entries(MODULOS).map(([id, texto]) => {
        const permitido = puede(usuario, 'ver:' + id);
        const clases = [moduloActivo === id ? 'activo' : '', permitido ? '' : 'bloqueado'].join(' ').trim();
        return (
          <button
            key={id}
            className={clases}
            onClick={() => onCambiar(id)}
            title={permitido ? undefined : 'Solo para Administradores'}
          >
            {!permitido && (
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            )}
            {texto}
          </button>
        );
      })}
    </nav>
  );
}

export default Menu;
