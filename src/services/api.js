/**
 * Servicio de datos de SIGEV.
 * Centraliza todas las operaciones para que los componentes no dependan
 * de dónde vienen los datos.
 *
 * USAR_API = false -> datos de prueba guardados en el navegador (localStorage)
 * USAR_API = true  -> llama a las API REST de SIGEV (actividad AA5)
 */
const USAR_API = false;
const URL_BASE = 'http://localhost:8080/SIGEV_Web/api';

// ---------- Datos de prueba iniciales ----------
const DATOS_INICIALES = {
  productos: [
    { codigo: 1, nombre: 'Camiseta básica', precio: 35000, stock: 20 },
    { codigo: 2, nombre: 'Jean clásico', precio: 89000, stock: 12 },
    { codigo: 3, nombre: 'Tenis deportivos', precio: 150000, stock: 8 }
  ],
  clientes: [
    { id: 1, documento: '1144000111', nombre: 'Ana Gómez', telefono: '3001234567', correo: 'ana@correo.com' },
    { id: 2, documento: '1130222333', nombre: 'Carlos Ruiz', telefono: '3157654321', correo: 'carlos@correo.com' }
  ],
  ventas: []
};

// Clave de cada recurso: los productos usan "codigo", el resto "id"
const CLAVE = { productos: 'codigo', clientes: 'id', ventas: 'idVenta' };

// ---------- Funciones internas para localStorage ----------
function leer(recurso) {
  try {
    const guardado = localStorage.getItem('sigev_' + recurso);
    return guardado ? JSON.parse(guardado) : [...DATOS_INICIALES[recurso]];
  } catch {
    return [...DATOS_INICIALES[recurso]];
  }
}

function escribir(recurso, lista) {
  try {
    localStorage.setItem('sigev_' + recurso, JSON.stringify(lista));
  } catch {
    /* si el navegador bloquea el almacenamiento, se sigue en memoria */
  }
}

// Calcula el siguiente id (como el AUTO_INCREMENT de MySQL)
function siguienteId(lista, clave) {
  return lista.length ? Math.max(...lista.map((x) => x[clave])) + 1 : 1;
}

// ---------- Funciones públicas ----------

/** Devuelve la lista de un recurso: 'productos', 'clientes' o 'ventas' */
export async function listar(recurso) {
  if (USAR_API) {
    const res = await fetch(`${URL_BASE}/${recurso}`);
    if (!res.ok) throw new Error('No se pudo cargar ' + recurso);
    return res.json();
  }
  return leer(recurso);
}

/** Crea un registro nuevo y lo devuelve con su id */
export async function guardar(recurso, datos) {
  if (USAR_API) {
    const res = await fetch(`${URL_BASE}/${recurso}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('No se pudo guardar');
    return res.json();
  }
  const lista = leer(recurso);
  const clave = CLAVE[recurso];
  const nuevo = { ...datos, [clave]: siguienteId(lista, clave) };
  escribir(recurso, [...lista, nuevo]);
  return nuevo;
}

/** Actualiza un registro existente */
export async function actualizar(recurso, datos) {
  const clave = CLAVE[recurso];
  if (USAR_API) {
    const res = await fetch(`${URL_BASE}/${recurso}/${datos[clave]}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) throw new Error('No se pudo actualizar');
    return res.json();
  }
  const lista = leer(recurso).map((x) => (x[clave] === datos[clave] ? datos : x));
  escribir(recurso, lista);
  return datos;
}

/** Elimina un registro por su id */
export async function eliminar(recurso, id) {
  if (USAR_API) {
    const res = await fetch(`${URL_BASE}/${recurso}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('No se pudo eliminar');
    return;
  }
  const clave = CLAVE[recurso];
  escribir(recurso, leer(recurso).filter((x) => x[clave] !== id));
}

/**
 * Registra una venta y descuenta el stock del producto.
 * Hace la misma validación que el backend: no vender más de lo que hay.
 */
export async function registrarVenta(venta) {
  if (USAR_API) return guardar('ventas', venta);

  const productos = leer('productos');
  const producto = productos.find((p) => p.codigo === venta.codigoProducto);
  if (!producto) throw new Error('El producto no existe');
  if (venta.cantidad > producto.stock) throw new Error('Stock insuficiente');

  // Descuenta el stock (como actualizarStock en ProductoDAO)
  producto.stock -= venta.cantidad;
  escribir('productos', productos);

  return guardar('ventas', {
    ...venta,
    total: producto.precio * venta.cantidad,
    fecha: new Date().toISOString().slice(0, 10)
  });
}

// ---------- Inicio de sesión ----------
// Usuarios de prueba mientras se construye el servicio de login (AA5)
const USUARIOS = [
  { correo: 'admin@sigev.com', clave: 'admin123', nombre: 'Administrador', rol: 'Admin' },
  { correo: 'vendedor@sigev.com', clave: 'vende123', nombre: 'Vendedor', rol: 'Vendedor' }
];

/** Valida correo y contraseña; devuelve el usuario sin la clave */
export async function iniciarSesion(correo, clave) {
  if (USAR_API) {
    const res = await fetch(`${URL_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, clave })
    });
    if (!res.ok) throw new Error('Correo o contraseña incorrectos');
    return res.json();
  }
  const u = USUARIOS.find((x) => x.correo === correo && x.clave === clave);
  if (!u) throw new Error('Correo o contraseña incorrectos');
  const { clave: _omitida, ...usuario } = u;
  return usuario;
}
