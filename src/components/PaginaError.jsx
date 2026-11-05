/**
 * Página de error de seguridad con los colores del logo de SIGEV.
 *  - 401: no hay sesión o expiró -> pantalla completa, botón para iniciar sesión
 *  - 403: el rol no tiene permiso -> dentro de la app, muestra el rol del usuario
 * Props:
 *  - codigo: 401 | 403
 *  - usuario: usuario conectado (solo 403)
 *  - modulo: nombre del módulo al que intentó entrar (solo 403, opcional)
 *  - mensaje: texto que mandó la API (opcional)
 *  - onAccion(): botón principal (iniciar sesión / volver)
 */
function PaginaError({ codigo, usuario, modulo, mensaje, onAccion }) {
  const es401 = codigo === 401;

  const texto = es401
    ? 'Tu sesión expiró o no has iniciado sesión. Por seguridad, vuelve a ingresar con tu correo y contraseña.'
    : modulo
      ? `El módulo ${modulo} es solo para Administradores.`
      : mensaje || 'Tu rol no tiene permiso para realizar esta acción.';

  return (
    <div className={`pagina-error ${es401 ? 'completa' : ''}`} role="alert">
      <div className="pe-tarjeta">
        {/* Cuadritos flotando, como las partículas del logo */}
        <div className="pe-particulas" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => <span key={i} />)}
        </div>

        <img src="/logo.png" alt="SIGEV" className="pe-logo" />

        <div className={`pe-icono ${es401 ? 'llave' : 'candado'}`} aria-hidden="true">
          {es401 ? <IconoLlave /> : <IconoCandado />}
        </div>

        <p className="pe-codigo">{codigo}</p>
        <h1 className="pe-titulo">{es401 ? 'Sesión no válida' : 'Acceso denegado'}</h1>
        <p className="pe-texto">{texto}</p>

        {!es401 && usuario && (
          <span className={`pe-rol rol-${usuario.rol.toLowerCase()}`}>
            Conectado como <strong>{usuario.nombre}</strong> · Rol {usuario.rol}
          </span>
        )}

        <button className="pe-boton" onClick={onAccion}>
          {es401 ? 'Iniciar sesión' : 'Volver al inicio'}
        </button>

        <small className="pe-pie">
          {es401
            ? 'La sesión se cierra sola tras 30 minutos sin actividad.'
            : 'Si necesitas este acceso, pídeselo a un Administrador.'}
        </small>
      </div>
    </div>
  );
}

function IconoCandado() {
  return (
    <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" r="1.4" fill="currentColor" />
    </svg>
  );
}

function IconoLlave() {
  return (
    <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.7 12.3 20 3M16 7l3 3M18 5l2 2" />
    </svg>
  );
}

export default PaginaError;
