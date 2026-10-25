import { useState } from 'react';
import { iniciarSesion } from '../services/api.js';

/**
 * Pantalla de inicio de sesión.
 * Props:
 *  - onIngresar(usuario, recordar): avisa a App que el usuario entró
 */
function Login({ onIngresar }) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [error, setError] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();

    // Validaciones básicas antes de consultar
    if (!correo.trim() || !clave) return setError('Ingrese correo y contraseña');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError('El correo no es válido');

    try {
      const usuario = await iniciarSesion(correo.trim().toLowerCase(), clave);
      setError('');
      onIngresar(usuario, recordar);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login">
      {/* Panel izquierdo: marca */}
      <div className="login-marca">
        <img src="/logo.png" alt="SIGEV" className="login-logo" />
        <div className="login-ola" />
        <div className="login-textos">
          <p className="login-titulo">Sistema de Gestión de Ventas</p>
          <p className="login-sub">Ferretería - Cali, Colombia</p>
        </div>
      </div>

      {/* Panel derecho: formulario */}
      <form className="login-form" onSubmit={manejarEnvio} noValidate>
        <h1>Iniciar sesión</h1>

        <label htmlFor="correo">Correo electrónico</label>
        <input id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />

        <label htmlFor="clave">Contraseña</label>
        <input id="clave" type="password" value={clave} onChange={(e) => setClave(e.target.value)} />

        <label className="login-check">
          <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
          Recordarme
        </label>

        {error && <small className="error">{error}</small>}

        <button type="submit" className="login-boton">INICIAR SESIÓN</button>

        <div className="login-prueba">
          <strong>CREDENCIALES DE PRUEBA</strong>
          <span>Admin: admin@sigev.com / admin123</span>
          <span>Vendedor: vendedor@sigev.com / vende123</span>
        </div>
      </form>
    </div>
  );
}

export default Login;
