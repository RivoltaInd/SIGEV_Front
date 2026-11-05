import { useEffect, useState } from 'react';
import { listar, guardar, actualizar, eliminar } from '../../services/api.js';
import { puede } from '../../permisos.js';
import Alerta from '../Alerta.jsx';
import ProductoForm from './ProductoForm.jsx';
import ProductoLista from './ProductoLista.jsx';

/**
 * Contenedor del módulo de Productos.
 * Maneja los datos y la comunicación con el servicio;
 * el formulario y la lista solo muestran y avisan.
 * El Vendedor solo consulta: no ve el formulario ni los botones de editar/eliminar.
 * Props: usuario (para saber qué puede hacer su rol)
 */
function ModuloProductos({ usuario }) {
  const puedeCrear = puede(usuario, 'crear:productos');
  const puedeEditar = puede(usuario, 'editar:productos');
  const puedeEliminar = puede(usuario, 'eliminar:productos');

  const [productos, setProductos] = useState([]);
  const [productoEditar, setProductoEditar] = useState(null);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  // Carga la lista de productos
  const cargar = async () => {
    try {
      setProductos(await listar('productos'));
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  // useEffect con [] se ejecuta una sola vez, al abrir el módulo
  useEffect(() => {
    cargar();
  }, []);

  // Crea o actualiza según si hay un producto en edición
  const manejarGuardar = async (producto) => {
    try {
      if (productoEditar) {
        await actualizar('productos', { ...producto, codigo: productoEditar.codigo });
        setAlerta({ tipo: 'exito', mensaje: 'Producto actualizado correctamente' });
      } else {
        await guardar('productos', producto);
        setAlerta({ tipo: 'exito', mensaje: 'Producto registrado correctamente' });
      }
      setProductoEditar(null);
      cargar();
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  const manejarEliminar = async (codigo) => {
    // Confirmación antes de borrar
    if (!window.confirm('¿Seguro que desea eliminar este producto?')) return;
    try {
      await eliminar('productos', codigo);
      setAlerta({ tipo: 'exito', mensaje: 'Producto eliminado' });
      cargar();
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  return (
    <section>
      <h2>Gestión de Productos</h2>
      <Alerta {...alerta} onCerrar={() => setAlerta({ tipo: '', mensaje: '' })} />
      {!puedeCrear && <span className="solo-lectura">Solo consulta · tu rol no modifica productos</span>}
      <div className={puedeCrear ? 'modulo' : 'modulo solo'}>
        {puedeCrear && (
          <ProductoForm
            productoEditar={productoEditar}
            onGuardar={manejarGuardar}
            onCancelar={() => setProductoEditar(null)}
          />
        )}
        <ProductoLista
          productos={productos}
          onEditar={puedeEditar ? setProductoEditar : undefined}
          onEliminar={puedeEliminar ? manejarEliminar : undefined}
        />
      </div>
    </section>
  );
}

export default ModuloProductos;
