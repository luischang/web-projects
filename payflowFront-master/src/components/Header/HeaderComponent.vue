<template>
  <q-toolbar class="header-toolbar">
    <div class="logo-bg" @click="$router.push('/inicio')" style="cursor: pointer">
      <img src="~assets/PayFlowS.jpg" alt="PayFlow Logo" class="payflow-logo" />
      <span class="logo-text">
        <span class="pay-text">Pay</span><span class="flow-text">Flow</span>
      </span>
    </div>

    <q-space />

    <div class="nav-group nav-group-centered">
      <q-btn
        flat
        no-caps
        label="Inicio"
        class="header-nav-btn"
        :class="{ 'active-nav-btn': $route.path === '/inicio' }"
        to="/inicio"
      />
      <q-btn
        flat
        no-caps
        label="Mis operaciones"
        class="header-nav-btn"
        :class="{ 'active-nav-btn': $route.path === '/mis-operaciones' }"
        to="/mis-operaciones"
      />
      <q-btn
        flat
        no-caps
        label="Transacciones"
        class="header-nav-btn"
        :class="{ 'active-nav-btn': $route.path === '/transacciones' }"
        to="/transacciones"
      />
      <q-btn
        flat
        no-caps
        label="Validación"
        class="header-nav-btn"
        :class="{ 'active-nav-btn': $route.path === '/validacion' }"
        to="/validacion"
      />
      <q-btn
        flat
        no-caps
        label="Ayuda"
        class="header-nav-btn"
        :class="{ 'active-nav-btn': $route.path === '/ayuda' }"
        to="/ayuda"
      />
    </div>

    <q-space />

    <div class="header-actions">
      <q-btn flat round dense icon="notifications" class="header-icon-btn">
        <q-badge
          v-if="notificacionesNoLeidas > 0"
          color="red"
          floating
          transparent
          :label="notificacionesNoLeidas"
          class="badge-ajustada"
        />

        <q-menu anchor="bottom end" self="top end">
          <q-list style="min-width: 250px">
            <q-item
              v-for="(noti, index) in notificacionesMostradas"
              :key="index"
              v-close-popup
              :class="{ 'bg-red-1': noti.estado !== 'Leido' }"
            >
              <q-item-section>
                <q-item-label>{{ noti.tipoNotificacion }}</q-item-label>
                <q-item-label caption>{{ noti.mensaje }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator v-if="hayMasDeTres" />
            <q-item v-if="hayMasDeTres" clickable @click="verMasNotificaciones">
              <q-item-section class="text-primary text-center"> Ver más... </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <span class="header-nav-btn-user">Hola! {{ nombreUsuario }}</span>
      <q-btn flat round dense icon="settings" class="header-icon-btn">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup @click="$router.push('/MiPerfil')">
              <q-item-section>Mi perfil</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="cerrarSesion">
              <q-item-section>Cerrar Sesión</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <q-dialog v-model="dialogoNotificaciones">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Todas las notificaciones</div>
        </q-card-section>
        <q-separator />

        <q-card-section>
          <q-list separator>
            <q-item
              v-for="(noti, index) in notificacionesRecientes"
              :key="index"
              :class="{ 'bg-red-1': noti.estado !== 'Leido' }"
            >
              <q-item-section avatar>
                <q-icon
                  :name="obtenerIcono(noti.tipoTransaccion)"
                  size="44px"
                  :class="obtenerColorIcono(noti.tipoTransaccion)"
                  class="q-mr-sm"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-bold">
                  {{ noti.tipoTransaccion }}
                </q-item-label>
                <q-item-label>{{ noti.mensaje }}</q-item-label>
                <q-item-label caption>{{ formatearFecha(noti.fechaHora) }}</q-item-label>
              </q-item-section>

              <q-item-section side v-if="noti.estado !== 'Leido'">
                <q-btn
                  dense
                  flat
                  round
                  icon="check"
                  color="primary"
                  @click="marcarComoLeido(noti.notificacionID)"
                  :title="'Marcar como leído'"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="between">
          <q-btn
            color="primary"
            label="Marcar todas como leído"
            icon="done_all"
            @click="marcarTodasComoLeidas"
            unelevated
            v-if="notificacionesNoLeidas > 0"
          />

          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-toolbar>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api as $api } from 'boot/axios'
import { useQuasar } from 'quasar' // 👈 Importar Quasar
const $q = useQuasar() // 👈 Instanciarlo

const nombreUsuario = ref('Usuario')
const router = useRouter()
//para notificaciones
const notificacionesNoLeidas = ref(0)
const notificacionesRecientes = ref([])
const notificacionesMostradas = computed(() => notificacionesRecientes.value.slice(0, 3))
const hayMasDeTres = computed(() => notificacionesRecientes.value.length > 3)
const dialogoNotificaciones = ref(false)

function verMasNotificaciones() {
  dialogoNotificaciones.value = true
}

function cerrarSesion() {
  localStorage.removeItem('user')
  localStorage.removeItem('userData')
  router.push('/login')
}

function formatearFecha(fechaIso) {
  const fecha = new Date(fechaIso)
  return fecha.toLocaleString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function obtenerIcono(tipo) {
  switch (tipo.toLowerCase()) {
    case 'depósito':
    case 'deposito':
      return 'mdi-bank-transfer-in'
    case 'retiro':
      return 'mdi-bank-transfer-out'
    case 'alerta':
      return 'mdi-alert-circle-outline'
    case 'aviso':
      return 'mdi-information-outline'
    default:
      return 'mdi-bell-outline'
  }
}

function obtenerColorIcono(tipo) {
  switch (tipo.toLowerCase()) {
    case 'retiro':
      return 'text-negative'
    case 'deposito':
      return 'text-positive'
    case 'transferencia':
      return 'text-info'
    case 'alerta':
    case 'error':
      return 'text-warning'
    default:
      return 'text-secondary'
  }
}

const obtenerNotificacionesRecientes = async () => {
  const userData = localStorage.getItem('userData') || localStorage.getItem('user')
  if (!userData) return

  const { token } = JSON.parse(userData)
  if (!token) return

  try {
    const response = await $api.get('/api/v1/Notificacion/usuario', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Ordenar descendente por fecha (opcional pero útil)
    const ordenadas = response.data.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))

    notificacionesRecientes.value = ordenadas
    //console.log('Notificaciones recientes obtenidas:', notificacionesRecientes.value)
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error)
  }
}

const obtenerNotificacionesNoLeidas = async () => {
  let userData = localStorage.getItem('userData') || localStorage.getItem('user')
  if (!userData) return

  const parsed = JSON.parse(userData)
  const token = parsed.token

  if (!token) return

  try {
    const response = await $api.get('/api/v1/Notificacion/no-leidas', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    notificacionesNoLeidas.value = response.data.cantidad
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error)
  }
}

async function marcarComoLeido(notificacionID) {
  console.log('Marcando notificación como leída:', notificacionID)
  const userData = localStorage.getItem('userData') || localStorage.getItem('user')
  if (!userData) return

  const { token } = JSON.parse(userData)
  if (!token) return

  try {
    await $api.put(`/api/v1/Notificacion/marcar-leida/${notificacionID}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Actualizar estado local de la notificación
    const noti = notificacionesRecientes.value.find((n) => n.notificacionID === notificacionID)
    if (noti) {
      noti.estado = 'Leido'
    }

    // Recalcular el número de no leídas
    notificacionesNoLeidas.value = notificacionesRecientes.value.filter(
      (n) => n.estado !== 'Leido',
    ).length
  } catch (error) {
    console.error('Error marcando como leída:', error)
  }
}
const marcarTodasComoLeidas = async () => {
  const userData = localStorage.getItem('userData') || localStorage.getItem('user')
  if (!userData) return

  const { token } = JSON.parse(userData)
  if (!token) return

  try {
    await $api.put('/api/v1/Notificacion/marcar-todas-como-leidas', null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Actualizar estado local
    notificacionesRecientes.value = notificacionesRecientes.value.map((n) => ({
      ...n,
      estado: 'Leido',
    }))
    notificacionesNoLeidas.value = 0

    $q.notify({
      type: 'positive',
      message: 'Todas las notificaciones han sido marcadas como leídas',
      position: 'top-right',
      timeout: 2500,
      icon: 'check_circle',
    })
  } catch (error) {
    console.error('Error marcando todas como leídas:', error)
  }
}

onMounted(async () => {
  let endpointUrl = '/api/v1/Usuarios/usuarioByjwt'
  let userData = localStorage.getItem('userData')
  let user = localStorage.getItem('user')
  let token = null
  if (userData) {
    const parsed = JSON.parse(userData)
    token = parsed.token
  } else if (user) {
    const parsed = JSON.parse(user)
    token = parsed.token
  }
  if (!token) {
    return
  }
  try {
    const response = await $api.get(endpointUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (response.data && response.data.nombres) {
      nombreUsuario.value = response.data.nombres
    }
  } catch {
    // Si falla, deja el nombre por defecto
  }
  await obtenerNotificacionesNoLeidas()
  await obtenerNotificacionesRecientes()
})

// notificacionesRecientes.value = [
//   {
//     notificacionID: 101,
//     tipoNotificacion: 'Depósito',
//     mensaje: 'Se ha realizado un depósito de S/ 200.00',
//     fechaHora: '2025-07-08T10:00:00',
//   },
//   {
//     notificacionID: 102,
//     tipoNotificacion: 'Retiro',
//     mensaje: 'Nuevo retiro pendiente de validación',
//     fechaHora: '2025-07-08T09:45:00',
//   },
//   {
//     notificacionID: 103,
//     tipoNotificacion: 'Alerta',
//     mensaje: 'Tu saldo es menor a S/ 10.00',
//     fechaHora: '2025-07-07T18:30:00',
//   },
//   {
//     notificacionID: 104,
//     tipoNotificacion: 'Aviso',
//     mensaje: 'Comprobante validado con éxito',
//     fechaHora: '2025-07-07T17:00:00',
//   },
// ]
</script>

<style scoped>
/* Estilos para la barra de herramientas y sus elementos */
.header-toolbar {
  height: 64px; /* Altura de la barra de herramientas */
  padding: 0 24px; /* Padding horizontal */
  background-color: #18077b; /* Fondo azul */
  border-bottom: 1px solid #e0e0e0; /* Borde inferior sutil */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Sombra ligera */
}

.logo-bg {
  display: flex;
  align-items: center;
  background: #222b45;
  border-radius: 12px;
  padding: 6px 18px 6px 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  margin-right: 30px; /* Espacio después del logo */
}

.payflow-logo {
  width: 32px; /* Tamaño del logo */
  height: 32px;
  margin-right: 8px; /* Espacio entre logo y texto */
}

.pay-text {
  color: #fff; /* Color blanco para "Pay" */
}

.flow-text {
  color: #18077b; /* Color azul para "Flow" */
}

.logo-text {
  font-size: 1.4rem;
  font-weight: bold;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
}

.header-nav-btn {
  font-size: 1rem;
  font-weight: 500;
  color: #fcfcfd;
  padding: 0 16px;
  margin: 0 8px;
  min-height: 48px;
  border-radius: 0;
  background: transparent;
  transition:
    color 0.3s ease,
    background 0.3s ease,
    border-bottom 0.3s ease;
}

.header-nav-btn:hover {
  color: #fff;
  background: #2a1a8c; /* Azul más bajo al pasar el mouse */
}

.active-nav-btn {
  color: #fff !important;
  background: transparent !important;
  font-weight: bold;
  border-bottom: 4px solid #fff; /* Línea blanca abajo */
  box-shadow: none;
}

.header-icon-btn {
  color: #fcfcfd;
  font-size: 1.5rem;
  margin-left: 16px;
  background: transparent;
  transition:
    color 0.3s,
    background 0.3s;
}

.header-icon-btn:hover {
  color: #fff;
  background: #2a1a8c;
}

/* Estilo para el botón de usuario para que parezca un enlace de navegación */
.header-nav-btn-user {
  font-size: 1rem;
  font-weight: 500;
  color: #fcfcfd;
  padding: 0 16px;
  margin: 0 8px;
  min-height: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  border-radius: 0;
  background: transparent;
  transition:
    color 0.3s,
    background 0.3s;
}

.header-nav-btn-user:hover {
  color: #fff;
  background: #2a1a8c;
}

.nav-group {
  display: flex;
}

.nav-group-centered {
  justify-content: center;
  gap: 32px; /* Espaciado más uniforme entre botones */
  flex: 0 1 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.badge-ajustada {
  top: 7px;
  right: -4px;
}
</style>
