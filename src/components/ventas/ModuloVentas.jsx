import { useEffect, useState } from 'react';
import { listar, registrarVenta } from '../../services/api.js';
import Alerta from '../Alerta.jsx';
import VentaForm from './VentaForm.jsx';
import VentaLista from './VentaLista.jsx';

/**
 * Contenedor del módulo de Ventas.
 * Carga ventas, productos y clientes porque la venta necesita los tres.
 */
function ModuloVentas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  // Promise.all carga los tres recursos al mismo tiempo
  const cargar = async () => {
    try {
      const [v, p, c] = await Promise.all([
        listar('ventas'),
        listar('productos'),
        listar('clientes')
      ]);
      setVentas(v);
      setProductos(p);
      setClientes(c);
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const manejarRegistrar = async (venta) => {
    try {
      const nueva = await registrarVenta(venta);
      setAlerta({
        tipo: 'exito',
        mensaje: `Venta #${nueva.idVenta} registrada. Total: $${nueva.total.toLocaleString('es-CO')}`
      });
      cargar(); // recarga para ver el stock actualizado
    } catch (e) {
      setAlerta({ tipo: 'error', mensaje: e.message });
    }
  };

  return (
    <section>
      <h2>Registro de Ventas</h2>
      <Alerta {...alerta} onCerrar={() => setAlerta({ tipo: '', mensaje: '' })} />
      <div className="modulo">
        <VentaForm productos={productos} clientes={clientes} onRegistrar={manejarRegistrar} />
        <VentaLista ventas={ventas} productos={productos} clientes={clientes} />
      </div>
    </section>
  );
}

export default ModuloVentas;
