// routes.js - Versión Corregida

const routes = [
  {
    path: '/',
    component: () => import('src/components/auth/LoginForm.vue'),
    meta: { hideMenu: true },
  },

  //inicio
  {
    path: '/inicio',
    component: () => import('src/pages/Inicio/Inicio.vue'),
  },

  // La ruta de mis-operaciones usará solo MisOperaciones.vue
  {
    path: '/mis-operaciones',
    component: () => import('pages/MisOperaciones.vue'),
  },

  //Mi perfil
  {
    path: '/MiPerfil',
    component: () => import('src/pages/Perfil/MiPerfil.vue'),
  },
  //Validacion
  {
    path: '/validacion',
    component: () => import('src/pages/validacion/mainValidacion.vue'),
  },

  //Ayuda
  {
    path: '/Ayuda',
    component: () => import('src/pages/Ayuda.vue'),
  },

  //Validar que deberia ir
  {
    path: '/Transacciones',
    component: () => import('src/pages/transacciones/mainTransacciones.vue'),
  },

  // Rutas de autenticación sin MainLayout (estas no deberían tener el menú)
  {
    path: '/login',
    component: () => import('src/components/auth/LoginForm.vue'),
    meta: { hideMenu: true },
  },
  {
    path: '/Register',
    component: () => import('src/components/auth/RegisterForm.vue'),
    meta: { hideMenu: true },
  },
  {
    path: '/ResetPassword',
    component: () => import('src/components/auth/ResetPassword.vue'),
    meta: { hideMenu: true },
  },
  {
    path: '/admin',
    component: () => import('layouts/admin/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Admin/DashboardHomePage.vue') },
      { path: 'administradores', component: () => import('pages/Admin/AdministradoresPage.vue') },
      { path: 'usuarios', component: () => import('pages/Admin/UsuariosPage.vue') },
    ],
  },
  {
    path: '/admin-login',
    component: () => import('src/components/auth/AdminLoginForm.vue'),
    meta: { hideMenu: true },
  },

  // Siempre deja esta como la última, para manejar rutas no encontradas
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
