/**
 * Permisos por rol en el front-end.
 * OJO: esto solo decide qué se MUESTRA (menús y botones). La protección real
 * está en el backend (SeguridadFilter + Permisos.java): aunque alguien cambie
 * este archivo, la API responde 403 si su rol no tiene permiso.
 * Las dos listas deben coincidir con Permisos.java.
 */
const REGLAS = {
  Admin: [
    'ver:productos', 'crear:productos', 'editar:productos', 'eliminar:productos',
    'ver:clientes', 'crear:clientes', 'editar:clientes', 'eliminar:clientes',
    'ver:ventas', 'registrar:ventas',
    'ver:usuarios', 'crear:usuarios', 'desactivar:usuarios',
    'ver:cuenta'
  ],
  Vendedor: [
    'ver:productos',
    'ver:clientes', 'crear:clientes', 'editar:clientes',
    'ver:ventas', 'registrar:ventas',
    'ver:cuenta' // cambiar su propia contraseña
  ]
};

/** ¿El usuario tiene este permiso? Ej: puede(usuario, 'eliminar:productos') */
export function puede(usuario, permiso) {
  return (REGLAS[usuario?.rol] || []).includes(permiso);
}

/** Nombre para mostrar de cada módulo */
export const MODULOS = {
  productos: 'Productos',
  clientes: 'Clientes',
  ventas: 'Ventas',
  usuarios: 'Usuarios'
};
