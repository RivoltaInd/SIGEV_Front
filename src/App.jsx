import { useEffect, useState } from 'react';
import Login from './components/Login.jsx';
import Menu from './components/Menu.jsx';
import PaginaError from './components/PaginaError.jsx';
import ModuloProductos from './components/productos/ModuloProductos.jsx';
import ModuloClientes from './components/clientes/ModuloClientes.jsx';
import ModuloVentas from './components/ventas/ModuloVentas.jsx';
import ModuloUsuarios from './components/usuarios/ModuloUsuarios.jsx';
import CambiarClave from './components/CambiarClave.jsx';
import { sesionActual, cerrarSesion } from './services/api.js';
import { puede, MODULOS } from './permisos.js';

/**
 * Componente raíz de SIGEV.
 * Estado:
 *  - usuario: quién inició sesión (null = mostrar Login)
 *  - cargando: true mientras se pregunta al servidor si ya hay sesión
 *  - moduloActivo: módulo que se está viendo
 *  - error: página de seguridad a mostrar ({codigo: 401|403, mensaje}) o null
 * No usa librería de rutas porque solo hay unos pocos módulos.
 */
function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [moduloActivo, setModuloActivo] = useState('productos');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Al abrir la app se pregunta al servidor si la sesión sigue activa
    sesionActual()
      .then(setUsuario)
      .finally(() => setCargando(false));

    // api.js avisa con estos eventos cuando la API responde 401 o 403
    const sinSesion = () => setError({ codigo: 401 });
    const denegado = (e) => setError({ codigo: 403, mensaje: e.detail });
    window.addEventListener('sigev:no-autenticado', sinSesion);
    window.addEventListener('sigev:acceso-denegado', denegado);
    return () => {
      window.removeEventListener('sigev:no-autenticado', sinSesion);
      window.removeEventListener('sigev:acceso-denegado', denegado);
    };
  }, []);

  const ingresar = (u) => {
    setUsuario(u);
    setError(null);
    setModuloActivo('productos');
  };

  const salir = async () => {
    await cerrarSesion();
    setUsuario(null);
    setError(null);
  };

  const cambiarModulo = (modulo) => {
    setError(null);
    setModuloActivo(modulo);
  };

  if (cargando) return <div className="cargando">Cargando SIGEV...</div>;

  // 401: la sesión expiró mientras se usaba la app
  if (error?.codigo === 401) {
    return <PaginaError codigo={401} onAccion={() => { setError(null); setUsuario(null); }} />;
  }

  // Renderizado condicional: sin sesión solo se ve el Login
  if (!usuario) return <Login onIngresar={ingresar} />;

  // Contenido del módulo: 403 si el rol no tiene permiso
  let contenido;
  if (error?.codigo === 403) {
    contenido = <PaginaError codigo={403} usuario={usuario} mensaje={error.mensaje}
      onAccion={() => cambiarModulo('productos')} />;
  } else if (!puede(usuario, 'ver:' + moduloActivo)) {
    contenido = <PaginaError codigo={403} usuario={usuario} modulo={MODULOS[moduloActivo]}
      onAccion={() => cambiarModulo('productos')} />;
  } else {
    contenido = (
      <>
        {moduloActivo === 'productos' && <ModuloProductos usuario={usuario} />}
        {moduloActivo === 'clientes' && <ModuloClientes usuario={usuario} />}
        {moduloActivo === 'ventas' && <ModuloVentas />}
        {moduloActivo === 'usuarios' && <ModuloUsuarios usuario={usuario} />}
        {moduloActivo === 'cuenta' && <CambiarClave usuario={usuario} />}
      </>
    );
  }

  return (
    <div className="app">
      <header className="encabezado">
        <img src="/logo.png" alt="SIGEV" className="encabezado-logo" />
        <div className="usuario">
          <span>{usuario.nombre} · <em>{usuario.rol}</em></span>
          <button onClick={() => cambiarModulo('cuenta')}>Mi cuenta</button>
          <button onClick={salir}>Cerrar sesión</button>
        </div>
      </header>

      {/* El menú recibe el usuario para marcar con candado lo que su rol no puede abrir */}
      <Menu usuario={usuario} moduloActivo={moduloActivo} onCambiar={cambiarModulo} />

      <main className="contenido">{contenido}</main>

      <footer className="pie">SENA - ADSO Ficha 3186610 · Faber Stiven Londoño Gil</footer>
    </div>
  );
}

export default App;
