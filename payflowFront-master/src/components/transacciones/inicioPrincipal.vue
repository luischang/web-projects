<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Card de Saldo Disponible -->
      <div class="col-xs-12 col-md-4 transfer-flex-container">
        <div class="account-card">
          <div class="account-title">Cuenta Soles</div>
          <div class="account-number">{{ numeroCuentaFormateado }}</div>
          <div class="account-balance-label">Saldo disponible</div>
          <div class="account-balance">S/. {{ saldo.toFixed(2) }}</div>
          <q-btn
            label="Iniciar operaciones"
            color="primary"
            class="q-mt-md"
            @click="redirigirAOperaciones"
          />
        </div>
      </div>

      <!-- Tabla de Últimas Transacciones -->
      <div class="col-12 col-md-8">
        <q-table
          title="Últimos Movimientos"
          title-class="text-h6 text-primary"
          :rows="ultimasTransacciones"
          :columns="columns"
          row-key="transaccionId"
          flat
          bordered
          class="bg-blue-1"
        >
          <template v-slot:body-cell-monto="props">
            <q-td :props="props" class="text-center">
              <span
                :class="[
                  props.row.tipoTransaccion === 'Retiro' ? 'text-negative' : 'text-primary',
                  'text-weight-bold',
                ]"
              >
                {{
                  props.row.tipoTransaccion === 'Retiro'
                    ? `- S/ ${props.row.monto}`
                    : `S/ ${props.row.monto}`
                }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-fechaHora="props">
            <q-td :props="props">
              {{ formatFecha(props.row.fechaHora) }}
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transfer-flex-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  flex-wrap: wrap;
  min-height: calc(100vh - 64px);
  padding: 2rem 0;
}
.account-card {
  background: #fff;
  min-width: 300px;
  max-width: 350px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 2.5rem;
}
.account-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #18077b;
  margin-bottom: 8px;
}
.account-number {
  font-size: 1.3rem;
  font-weight: 600;
  color: #888;
  margin-bottom: 8px;
}
.account-balance-label {
  color: #888;
  font-size: 1rem;
  margin-bottom: 4px;
}
.account-balance {
  font-size: 1.5rem;
  font-weight: bold;
  color: #18077b;
  margin-top: 8px;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const saldo = ref(0)
let numeroCuentaFormateado = ref(0)
const ultimasTransacciones = ref([])

const columns = [
  { name: 'tipoTransaccion', label: 'Tipo', field: 'tipoTransaccion', align: 'left' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'center' },
  { name: 'fechaHora', label: 'Fecha y Hora', field: 'fechaHora', align: 'center' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
]

const formatFecha = (fechaIso) => {
  const fecha = new Date(fechaIso)
  return fecha.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const token = userData.token

    if (!token) {
      $q.notify({ type: 'negative', message: 'No hay token disponible' })
      return
    }

    const response = await fetch('http://localhost:5077/api/v1/Transacciones/resumen-inicio', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error(`Error ${response.status}`)
    const data = await response.json()

    console.log('Resumen de inicio:', data)
    saldo.value = data.saldo || 0
    ultimasTransacciones.value = data.movimientos || []
    let numeroCuenta = data.numeroCuenta || 'No disponible'
    numeroCuentaFormateado = computed(() => `${numeroCuenta.slice(0, 3)}-${numeroCuenta.slice(3)}`)
  } catch (err) {
    console.error('❌ Error al cargar resumen de inicio:', err)
    $q.notify({ type: 'negative', message: 'Error al cargar los datos de inicio' })
  }
})

function redirigirAOperaciones() {
  window.location.href = 'http://localhost:9000/#/mis-operaciones'
}
</script>
