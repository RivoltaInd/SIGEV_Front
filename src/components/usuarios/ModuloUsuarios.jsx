import { useEffect, useState } from 'react';
import { listar, registrarUsuario, cambiarEstadoUsuario, validarClaveNueva } from '../../services/api.js';
import Alerta from '../Alerta.jsx';

const VACIO = { nombre: '', correo: '', clave: '', rol: 'Vendedor' };

/**
 * Módulo de Usuarios (solo Admin).
 * Registra usuarios nuevos con /api/registro, los lista y permite
 * activarlos o desactivarlos. Un usuario desactivado no puede entrar y,
 * si tenía la sesión abierta, el servidor se la corta en su siguiente acción.
 * La contraseña viaja una sola vez al servidor, que la guarda cifrada;
 * la lista nunca la muestra.
 * Props: usuario (el Admin conectado, que no puede desactivarse a sí mismo)
 */
function ModuloUsuarios({ usuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  const cargar = async () => {
    try {
      setUsuarios(await listar('usuarios'));
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const manejarCambio = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Mismas reglas que valida RegistroApi en el servidor
  const validar = () => {
    const err = {};
    if (form.nombre.trim().length < 3) err.nombre = 'El nombre debe tener al menos 3 letras';
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.correo.trim())) err.correo = 'El correo no es válido';
    const msg = validarClaveNueva(form.clave, form.correo.trim());
    if (msg) err.clave = msg;
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    try {
      const nuevo = await registrarUsuario({
        nombre: form.nombre.trim(),
        correo: form.correo.trim().toLowerCase(),
        clave: form.clave,
        rol: form.rol
      });
      setAlerta({ tipo: 'exito', mensaje: `Usuario ${nuevo.correo} registrado como ${nuevo.rol}` });
      setForm(VACIO);
      cargar();
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  const manejarEstado = async (u) => {
    const accion = u.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Seguro que desea ${accion} a ${u.nombre}?`)) return;
    try {
      await cambiarEstadoUsuario(u.id, !u.activo);
      setAlerta({ tipo: 'exito', mensaje: `Usuario ${u.correo} ${u.activo ? 'desactivado' : 'activado'}` });
      cargar();
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  return (
    <section>
      <h2>Gestión de Usuarios</h2>
      <Alerta {...alerta} onCerrar={() => setAlerta({ tipo: '', mensaje: '' })} />
      <div className="modulo">
        <form className="tarjeta formulario" onSubmit={manejarEnvio} noValidate>
          <h3>Nuevo usuario</h3>

          <label>Nombre</label>
          <input name="nombre" value={form.nombre} onChange={manejarCambio} />
          {errores.nombre && <small className="error">{errores.nombre}</small>}

          <label>Correo</label>
          <input name="correo" type="email" value={form.correo} onChange={manejarCambio} />
          {errores.correo && <small className="error">{errores.correo}</small>}

          <label>Contraseña</label>
          <input name="clave" type="password" autoComplete="new-password" value={form.clave} onChange={manejarCambio} />
          {errores.clave && <small className="error">{errores.clave}</small>}
          <small className="ayuda">Mínimo 10 caracteres, con letras y números.</small>

          <label>Rol</label>
          <select name="rol" value={form.rol} onChange={manejarCambio}>
            <option value="Vendedor">Vendedor</option>
            <option value="Admin">Admin</option>
          </select>

          <div className="acciones">
            <button type="submit" className="primario">Registrar</button>
          </div>
        </form>

        <div className="tarjeta lista">
          <h3>Usuarios del sistema ({usuarios.length})</h3>
          <table>
            <thead>
              <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className={u.activo ? '' : 'inactivo'}>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>{u.rol}</td>
                  <td>
                    <span className={`estado ${u.activo ? 'activo' : 'inactivo'}`}>
                      {u.activo ? 'Activo' : 'Desactivado'}
                    </span>
                  </td>
                  <td>
                    {/* El Admin no puede desactivarse a sí mismo (el servidor también lo impide) */}
                    {u.correo !== usuario.correo && (
                      <button className={u.activo ? 'peligro' : ''} onClick={() => manejarEstado(u)}>
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ModuloUsuarios;
