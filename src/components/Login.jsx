import { useState } from 'react';
import { iniciarSesion } from '../services/api.js';

/**
 * Pantalla de inicio de sesión.
 * "Recordarme" hace que la sesión en el servidor dure 8 horas en vez de 30 minutos.
 * Props:
 *  - onIngresar(usuario): avisa a App que el usuario entró
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
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(correo)) return setError('El correo no es válido');

    try {
      const usuario = await iniciarSesion(correo.trim().toLowerCase(), clave, recordar);
      setError('');
      onIngresar(usuario);
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
      </form>
    </div>
  );
}

export default Login;
