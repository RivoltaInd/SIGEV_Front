import { useEffect, useState } from 'react';

const VACIO = { documento: '', nombre: '', telefono: '', correo: '' };

/**
 * Formulario controlado de clientes.
 * Usa onBlur para validar documento y correo apenas el usuario sale del campo.
 * Props: clienteEditar, onGuardar(cliente), onCancelar()
 */
function ClienteForm({ clienteEditar, onGuardar, onCancelar }) {
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    setForm(clienteEditar ? { ...clienteEditar } : VACIO);
    setErrores({});
  }, [clienteEditar]);

  const manejarCambio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Valida un solo campo y devuelve el mensaje de error (o '')
  const validarCampo = (nombre, valor) => {
    switch (nombre) {
      case 'documento':
        if (!/^\d{6,10}$/.test(valor)) return 'El documento debe tener entre 6 y 10 números';
        return '';
      case 'nombre':
        if (valor.trim().length < 3) return 'El nombre debe tener al menos 3 letras';
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(valor.trim())) return 'El nombre solo admite letras';
        return '';
      case 'telefono':
        if (valor && !/^\d{7,10}$/.test(valor)) return 'El teléfono debe tener entre 7 y 10 números';
        return '';
      case 'correo':
        if (valor && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'El correo no es válido';
        return '';
      default:
        return '';
    }
  };

  // onBlur: valida al salir del campo
  const manejarBlur = (e) => {
    setErrores({ ...errores, [e.target.name]: validarCampo(e.target.name, e.target.value) });
  };

  const manejarEnvio = (e) => {
    e.preventDefault();
    const err = {};
    Object.keys(VACIO).forEach((campo) => {
      const msg = validarCampo(campo, form[campo]);
      if (msg) err[campo] = msg;
    });
    setErrores(err);
    if (Object.keys(err).length > 0) return;

    onGuardar({
      documento: form.documento,
      nombre: form.nombre.trim(),
      telefono: form.telefono,
      correo: form.correo.trim()
    });
    setForm(VACIO);
  };

  // Pequeño ayudante para no repetir el mismo bloque 4 veces
  const campo = (name, label, tipo = 'text') => (
    <>
      <label>{label}</label>
      <input name={name} type={tipo} value={form[name]} onChange={manejarCambio} onBlur={manejarBlur} />
      {errores[name] && <small className="error">{errores[name]}</small>}
    </>
  );

  return (
    <form className="tarjeta formulario" onSubmit={manejarEnvio} noValidate>
      <h3>{clienteEditar ? 'Editar cliente' : 'Nuevo cliente'}</h3>
      {campo('documento', 'Documento')}
      {campo('nombre', 'Nombre completo')}
      {campo('telefono', 'Teléfono (opcional)', 'tel')}
      {campo('correo', 'Correo (opcional)', 'email')}
      <div className="acciones">
        <button type="submit" className="primario">{clienteEditar ? 'Actualizar' : 'Guardar'}</button>
        {clienteEditar && <button type="button" onClick={onCancelar}>Cancelar</button>}
      </div>
    </form>
  );
}

export default ClienteForm;
