import { useEffect, useState } from 'react';

const VACIO = { nombre: '', precio: '', stock: '' };

/**
 * Formulario controlado para crear o editar un producto.
 * Props:
 *  - productoEditar: producto a editar o null si es nuevo
 *  - onGuardar(producto): envía los datos validados al módulo
 *  - onCancelar(): cancela la edición
 */
function ProductoForm({ productoEditar, onGuardar, onCancelar }) {
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});

  // Cuando llega un producto para editar, se llenan los campos
  useEffect(() => {
    setForm(productoEditar ? { ...productoEditar } : VACIO);
    setErrores({});
  }, [productoEditar]);

  // onChange: actualiza el campo que cambió
  const manejarCambio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Reglas de validación
  const validar = () => {
    const err = {};
    if (form.nombre.trim() === '') err.nombre = 'El nombre es obligatorio';
    if (form.precio === '' || Number(form.precio) <= 0) err.precio = 'El precio debe ser mayor a 0';
    if (form.stock === '' || Number(form.stock) < 0 || !Number.isInteger(Number(form.stock)))
      err.stock = 'El stock debe ser un número entero mayor o igual a 0';
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  // onSubmit: evita recargar la página, valida y envía
  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!validar()) return;
    onGuardar({
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock)
    });
    setForm(VACIO);
  };

  return (
    <form className="tarjeta formulario" onSubmit={manejarEnvio} noValidate>
      <h3>{productoEditar ? 'Editar producto' : 'Nuevo producto'}</h3>

      <label>Nombre</label>
      <input name="nombre" value={form.nombre} onChange={manejarCambio} />
      {errores.nombre && <small className="error">{errores.nombre}</small>}

      <label>Precio</label>
      <input name="precio" type="number" value={form.precio} onChange={manejarCambio} />
      {errores.precio && <small className="error">{errores.precio}</small>}

      <label>Stock</label>
      <input name="stock" type="number" value={form.stock} onChange={manejarCambio} />
      {errores.stock && <small className="error">{errores.stock}</small>}

      <div className="acciones">
        <button type="submit" className="primario">
          {productoEditar ? 'Actualizar' : 'Guardar'}
        </button>
        {productoEditar && (
          <button type="button" onClick={onCancelar}>Cancelar</button>
        )}
      </div>
    </form>
  );
}

export default ProductoForm;
