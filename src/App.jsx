import { useState } from 'react';
import Login from './components/Login.jsx';
import Menu from './components/Menu.jsx';
import ModuloProductos from './components/productos/ModuloProductos.jsx';
import ModuloClientes from './components/clientes/ModuloClientes.jsx';
import ModuloVentas from './components/ventas/ModuloVentas.jsx';

// Lee la sesión guardada si el usuario marcó "Recordarme"
function sesionGuardada() {
  try {
    return JSON.parse(localStorage.getItem('sigev_sesion'));
  } catch {
    return null;
  }
}

/**
 * Componente raíz de SIGEV.
 * Estado:
 *  - usuario: quién inició sesión (null = mostrar Login)
 *  - moduloActivo: módulo que se está viendo
 * No usa librería de rutas porque solo hay 3 módulos.
 */
function App() {
  const [usuario, setUsuario] = useState(sesionGuardada);
  const [moduloActivo, setModuloActivo] = useState('productos');

  const ingresar = (u, recordar) => {
    if (recordar) {
      try { localStorage.setItem('sigev_sesion', JSON.stringify(u)); } catch { /* sin almacenamiento */ }
    }
    setUsuario(u);
  };

  const salir = () => {
    try { localStorage.removeItem('sigev_sesion'); } catch { /* sin almacenamiento */ }
    setUsuario(null);
    setModuloActivo('productos');
  };

  // Renderizado condicional: sin sesión solo se ve el Login
  if (!usuario) return <Login onIngresar={ingresar} />;

  return (
    <div className="app">
      <header className="encabezado">
        <img src="/logo.png" alt="SIGEV" className="encabezado-logo" />
        <div className="usuario">
          <span>{usuario.nombre} · <em>{usuario.rol}</em></span>
          <button onClick={salir}>Cerrar sesión</button>
        </div>
      </header>

      {/* El menú recibe el módulo activo y la función para cambiarlo */}
      <Menu moduloActivo={moduloActivo} onCambiar={setModuloActivo} />

      <main className="contenido">
        {moduloActivo === 'productos' && <ModuloProductos />}
        {moduloActivo === 'clientes' && <ModuloClientes />}
        {moduloActivo === 'ventas' && <ModuloVentas />}
      </main>

      <footer className="pie">SENA - ADSO Ficha 3186610 · Faber Stiven Londoño Gil</footer>
    </div>
  );
}

export default App;
