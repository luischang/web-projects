<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <img src="~assets/payflow_transparente_azul_horiz-1.png" alt="PayFlow Logo" class="payflow-logo" />
        </q-toolbar-title>
        <div class="q-gutter-sm row items-center" @click.stop>
          <q-btn
            v-for="(item, idx) in menuOptions"
            :key="idx"
            flat
            dense
            :label="item.label"
            @click="goTo(item.route)"
            :color="isActiveStrict(item.route) ? 'primary' : undefined"
            :text-color="isActiveStrict(item.route) ? 'white' : undefined"
            :unelevated="isActiveStrict(item.route)"
            :no-caps="true"
            :outline="!isActiveStrict(item.route)"
            class="menu-btn"
            :class="{ active: isActiveStrict(item.route) }"
          />
        </div>
        <q-space />
        <q-btn ref="profileBtn" flat round dense icon="account_circle" aria-label="Perfil" @click.stop="showProfileMenu = true" />
        <q-menu v-model="showProfileMenu" :anchor="anchorOrigin" :self="selfOrigin" :context-menu="false" :target="profileBtnEl">
          <q-list style="min-width: 180px;">
            <q-item clickable @click="goToAccount">
              <q-item-section>Mi cuenta</q-item-section>
            </q-item>
            <q-item clickable @click="logout">
              <q-item-section>Salir</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-toolbar>
    </q-header>

    <!-- Contenido principal sin sidebar -->
    <main class="main-content">
      <q-page-container>
        <router-view />
      </q-page-container>
    </main>

    <!-- Footer -->
    <q-footer class="bg-grey-3 text-grey-8" elevated height-hint="50">
      <div class="q-pa-md text-center">
        © 2025 - Créditos: Grupo 2
      </div>
    </q-footer>
  </q-layout>
</template>

<script>
export default {
  name: 'DashboardLayout',
  data() {
    return {
      menuOptions: [
        { label: 'Inicio', route: '/admin' },
        { label: 'Administradores', route: '/admin/administradores' },
        { label: 'Usuarios', route: '/admin/usuarios' },
        { label: 'Reportes', route: '/admin/reportes' },
        { label: 'Validar comprobante', route: '/admin/validar-comprobante' },
      ],
      showNotifications: false,
      showProfileMenu: false,
      notifications: [
        'Tienes una nueva transacción',
        'Actualización disponible',
        'Recordatorio de reunión',
        'Mensaje del administrador'
      ],
      anchorOrigin: 'bottom right',
      selfOrigin: 'top right'
    }
  },
  computed: {
    notifBtnEl() {
      return this.$refs.notifBtn && this.$refs.notifBtn.$el
    },
    profileBtnEl() {
      return this.$refs.profileBtn && this.$refs.profileBtn.$el
    }
  },
  methods: {
    goTo(route) {
      if (this.$route.path !== route) {
        this.$router.push(route)
      }
    },
    isActiveStrict(route) {
      // Solo resalta si la ruta es exactamente igual
      return this.$route.path === route
    },
    goToAccount() {
      this.showProfileMenu = false
      this.$router.push('/admin/mi-cuenta')
    },
    logout() {
      this.showProfileMenu = false
      // Aquí puedes agregar la lógica de cierre de sesión
      this.$router.push('/admin/login')
    }
  }
}
</script>

<style scoped>
.sidebar {
  border-right: 1px solid #e0e0e0;
}
.main-content {
  min-height: 100%;
}
.menu-btn {
  transition: box-shadow 0.2s, background 0.2s;
}
.menu-btn.q-btn--unelevated.q-btn--primary {
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  font-weight: bold;
  background: #1976d2 !important; /* primary color */
}
.menu-btn.q-btn--unelevated.q-btn--primary:hover,
.menu-btn.q-btn--unelevated.q-btn--primary:focus {
  background: #115293 !important; /* darker primary */
}
.menu-btn.active {
  background: #1565c0 !important; /* even darker for active */
}
.q-header{
  background-color: #0F1233;
}
.payflow-logo {
  height: 50px;
  flex-shrink: 0;
  aspect-ratio: 328/93;
}
</style>
