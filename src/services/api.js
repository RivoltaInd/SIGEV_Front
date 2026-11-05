/**
 * Servicio de datos de SIGEV.
 * Centraliza todas las operaciones para que los componentes no dependan
 * de dónde vienen los datos.
 *
 * USAR_API = false -> datos de prueba guardados en el navegador (localStorage)
 * USAR_API = true  -> llama a las API REST de SIGEV_Web (actividad AA5)
 *
 * Con la API, la sesión vive en el servidor (cookie HttpOnly que JavaScript
 * no puede leer). Si la API responde 401 o 403 se avisa a App con un evento
 * para que muestre la página de error correspondiente.
 */
const USAR_API = true;
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
  ventas: [],
  usuarios: []
};

// Clave de cada recurso: los productos usan "codigo", el resto "id"
const CLAVE = { productos: 'codigo', clientes: 'id', ventas: 'idVenta' };

// ---------- Llamadas a la API ----------

/**
 * Hace la petición y devuelve el JSON de respuesta.
 * Si la API responde con error, usa su mensaje ({"error": "..."});
 * si no hay mensaje, usa mensajeDefecto.
 * avisar = false evita disparar la página 401/403 (por ejemplo al revisar
 * si hay sesión al abrir la app, o en el propio login).
 */
async function pedir(ruta, opciones, mensajeDefecto, avisar = true) {
  let res;
  try {
    res = await fetch(URL_BASE + ruta, {
      ...opciones,
      credentials: 'include', // envía la cookie de sesión
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    throw new Error('No hay conexión con el servidor de SIGEV');
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    const mensaje = cuerpo?.error || mensajeDefecto;
    if (avisar && res.status === 401) window.dispatchEvent(new CustomEvent('sigev:no-autenticado'));
    if (avisar && res.status === 403) window.dispatchEvent(new CustomEvent('sigev:acceso-denegado', { detail: mensaje }));
    throw new Error(mensaje);
  }
  // 204 (eliminar, cerrar sesión) no trae cuerpo
  return res.status === 204 ? null : res.json();
}

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

/** Devuelve la lista de un recurso: 'productos', 'clientes', 'ventas' o 'usuarios' */
export async function listar(recurso) {
  if (USAR_API) return pedir(`/${recurso}`, {}, 'No se pudo cargar ' + recurso);
  return leer(recurso);
}

/** Crea un registro nuevo y lo devuelve con su id */
export async function guardar(recurso, datos) {
  if (USAR_API) {
    return pedir(`/${recurso}`, { method: 'POST', body: JSON.stringify(datos) }, 'No se pudo guardar');
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
    return pedir(`/${recurso}/${datos[clave]}`, { method: 'PUT', body: JSON.stringify(datos) },
      'No se pudo actualizar');
  }
  const lista = leer(recurso).map((x) => (x[clave] === datos[clave] ? datos : x));
  escribir(recurso, lista);
  return datos;
}

/** Elimina un registro por su id */
export async function eliminar(recurso, id) {
  if (USAR_API) {
    await pedir(`/${recurso}/${id}`, { method: 'DELETE' }, 'No se pudo eliminar');
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

/** Crea un usuario nuevo (solo Admin). Solo funciona con la API. */
export async function registrarUsuario(datos) {
  if (!USAR_API) throw new Error('El registro de usuarios requiere la API');
  return pedir('/registro', { method: 'POST', body: JSON.stringify(datos) }, 'No se pudo registrar el usuario');
}

/** Activa o desactiva un usuario (solo Admin). */
export async function cambiarEstadoUsuario(id, activo) {
  if (!USAR_API) throw new Error('La gestión de usuarios requiere la API');
  return pedir(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify({ activo }) },
    'No se pudo actualizar el usuario');
}

/** Cambia la contraseña del usuario conectado. Solo funciona con la API. */
export async function cambiarClave(claveActual, claveNueva) {
  if (!USAR_API) throw new Error('El cambio de contraseña requiere la API');
  return pedir('/cambiar-clave', { method: 'POST', body: JSON.stringify({ claveActual, claveNueva }) },
    'No se pudo cambiar la contraseña');
}

/**
 * Mismas reglas de contraseña que valida el servidor (CambiarClaveApi.validarNueva).
 * Devuelve el mensaje de error o '' si es válida.
 */
export function validarClaveNueva(nueva, correo = '') {
  if (nueva.length < 10 || nueva.length > 100) return 'Debe tener entre 10 y 100 caracteres';
  if (!/[A-Za-z]/.test(nueva) || !/\d/.test(nueva)) return 'Debe tener letras y números';
  if (nueva.toLowerCase() === correo.toLowerCase() || nueva.toLowerCase().includes('sigev'))
    return 'Es muy fácil de adivinar';
  return '';
}

// ---------- Sesión ----------
// Usuarios SOLO para el modo demo sin API (USAR_API = false). No son las cuentas
// reales: las reales están en la tabla usuario, con contraseña cifrada, y nunca
// deben escribirse en el código del front (cualquiera puede leerlo en el navegador).
const USUARIOS = [
  { correo: 'admin@demo.local', clave: 'demo-admin', nombre: 'Admin Demo', rol: 'Admin' },
  { correo: 'vendedor@demo.local', clave: 'demo-vendedor', nombre: 'Vendedor Demo', rol: 'Vendedor' }
];

/** Valida correo y contraseña; devuelve el usuario sin la clave */
export async function iniciarSesion(correo, clave, recordar) {
  if (USAR_API) {
    return pedir('/login', { method: 'POST', body: JSON.stringify({ correo, clave, recordar }) },
      'Correo o contraseña incorrectos', false);
  }
  const u = USUARIOS.find((x) => x.correo === correo && x.clave === clave);
  if (!u) throw new Error('Correo o contraseña incorrectos');
  const { clave: _omitida, ...usuario } = u;
  return usuario;
}

/** Usuario con sesión activa en el servidor, o null si no hay sesión */
export async function sesionActual() {
  if (!USAR_API) return null;
  try {
    return await pedir('/sesion', {}, 'Sin sesión', false);
  } catch {
    return null;
  }
}

/** Cierra la sesión en el servidor */
export async function cerrarSesion() {
  if (!USAR_API) return;
  try {
    await pedir('/logout', { method: 'POST' }, 'No se pudo cerrar sesión', false);
  } catch {
    /* si el servidor no responde, igual se sale en la pantalla */
  }
}
