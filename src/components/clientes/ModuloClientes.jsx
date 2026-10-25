import { useEffect, useState } from 'react';
import { listar, guardar, actualizar, eliminar } from '../../services/api.js';
import Alerta from '../Alerta.jsx';
import ClienteForm from './ClienteForm.jsx';
import ClienteLista from './ClienteLista.jsx';

/**
 * Contenedor del módulo de Clientes.
 * Sigue el mismo patrón del módulo de Productos.
 */
function ModuloClientes() {
  const [clientes, setClientes] = useState([]);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  const cargar = async () => {
    try {
      setClientes(await listar('clientes'));
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const manejarGuardar = async (cliente) => {
    // Regla de negocio: el documento no se puede repetir
    const repetido = clientes.some(
      (c) => c.documento === cliente.documento && c.id !== clienteEditar?.id
    );
    if (repetido) {
      setAlerta({ tipo: 'error', mensaje: 'Ya existe un cliente con ese documento' });
      return;
    }
    try {
      if (clienteEditar) {
        await actualizar('clientes', { ...cliente, id: clienteEditar.id });
        setAlerta({ tipo: 'exito', mensaje: 'Cliente actualizado correctamente' });
      } else {
        await guardar('clientes', cliente);
        setAlerta({ tipo: 'exito', mensaje: 'Cliente registrado correctamente' });
      }
      setClienteEditar(null);
      cargar();
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  const manejarEliminar = async (id) => {
    if (!window.confirm('¿Seguro que desea eliminar este cliente?')) return;
    try {
      await eliminar('clientes', id);
      setAlerta({ tipo: 'exito', mensaje: 'Cliente eliminado' });
      cargar();
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  return (
    <section>
      <h2>Gestión de Clientes</h2>
      <Alerta {...alerta} onCerrar={() => setAlerta({ tipo: '', mensaje: '' })} />
      <div className="modulo">
        <ClienteForm
          clienteEditar={clienteEditar}
          onGuardar={manejarGuardar}
          onCancelar={() => setClienteEditar(null)}
        />
        <ClienteLista clientes={clientes} onEditar={setClienteEditar} onEliminar={manejarEliminar} />
      </div>
    </section>
  );
}

export default ModuloClientes;
