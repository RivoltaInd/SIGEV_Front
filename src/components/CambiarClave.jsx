import { useState } from 'react';
import { cambiarClave, validarClaveNueva } from '../services/api.js';
import Alerta from './Alerta.jsx';

const VACIO = { actual: '', nueva: '', confirmar: '' };

/**
 * Cambio de contraseña del usuario conectado (cualquier rol).
 * El servidor exige la contraseña actual y solo cambia la de quien tiene
 * la sesión. Aquí se validan las mismas reglas para avisar antes de enviar.
 * Props: usuario (para no permitir el correo como contraseña)
 */
function CambiarClave({ usuario }) {
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  const manejarCambio = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const manejarEnvio = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.actual) err.actual = 'Ingrese su contraseña actual';
    const msg = validarClaveNueva(form.nueva, usuario.correo);
    if (msg) err.nueva = msg;
    else if (form.nueva === form.actual) err.nueva = 'Debe ser diferente a la actual';
    if (form.confirmar !== form.nueva) err.confirmar = 'Las contraseñas no coinciden';
    setErrores(err);
    if (Object.keys(err).length > 0) return;

    try {
      await cambiarClave(form.actual, form.nueva);
      setAlerta({ tipo: 'exito', mensaje: 'Contraseña actualizada' });
      setForm(VACIO);
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  // Pequeño ayudante para no repetir el mismo bloque 3 veces
  const campo = (name, label, autoComplete) => (
    <>
      <label>{label}</label>
      <input name={name} type="password" autoComplete={autoComplete} value={form[name]} onChange={manejarCambio} />
      {errores[name] && <small className="error">{errores[name]}</small>}
    </>
  );

  return (
    <section>
      <h2>Mi cuenta</h2>
      <Alerta {...alerta} onCerrar={() => setAlerta({ tipo: '', mensaje: '' })} />
      <form className="tarjeta formulario cuenta" onSubmit={manejarEnvio} noValidate>
        <h3>Cambiar contraseña</h3>
        <p className="vacio">{usuario.nombre} · {usuario.correo} · {usuario.rol}</p>
        {campo('actual', 'Contraseña actual', 'current-password')}
        {campo('nueva', 'Contraseña nueva', 'new-password')}
        <small className="ayuda">Mínimo 10 caracteres, con letras y números.</small>
        {campo('confirmar', 'Confirmar contraseña nueva', 'new-password')}
        <div className="acciones">
          <button type="submit" className="primario">Cambiar contraseña</button>
        </div>
      </form>
    </section>
  );
}

export default CambiarClave;
