/**
 * Mensaje reutilizable de éxito o error.
 * Props:
 *  - tipo: 'exito' | 'error'
 *  - mensaje: texto a mostrar
 *  - onCerrar(): función para ocultar la alerta
 */
function Alerta({ tipo, mensaje, onCerrar }) {
  // Si no hay mensaje no se dibuja nada
  if (!mensaje) return null;

  return (
    <div className={`alerta ${tipo}`}>
      <span>{mensaje}</span>
      <button onClick={onCerrar} aria-label="Cerrar">×</button>
    </div>
  );
}

export default Alerta;
