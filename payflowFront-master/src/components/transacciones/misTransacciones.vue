<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Filtro -->
      <div class="col-12 col-md-4">
        <q-card bordered class="q-pa-md">
          <div class="text-subtitle1">Filtrar por</div>
          <q-option-group
            v-model="filtroTipo"
            :options="tipoOpciones"
            type="radio"
            inline
            class="q-mt-sm"
          />

          <q-separator class="q-my-md" />

          <q-input filled v-model="fechaInicio" mask="####/##/##" placeholder="yyyy/mm/dd">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="popupInicio" transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="fechaInicio"
                    mask="YYYY/MM/DD"
                    @update:model-value="$refs.popupInicio.hide()"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <div class="q-mt-sm q-mb-sm">Fecha de Fin</div>
          <q-input filled v-model="fechaFin" mask="####/##/##" placeholder="yyyy/mm/dd">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="popupFin" transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="fechaFin"
                    mask="YYYY/MM/DD"
                    @update:model-value="$refs.popupFin.hide()"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-btn
            label="Aplicar Filtros"
            color="primary"
            class="q-mt-md full-width"
            @click="aplicarFiltros"
          />
          <q-btn
            label="Limpiar Filtros"
            color="secondary"
            class="q-mt-sm full-width"
            @click="limpiarFiltros"
          />
        </q-card>
      </div>

      <!-- Tabla -->
      <div class="col-12 col-md-8">
        <q-table
          title="Mis Transacciones"
          :rows="transaccionesFiltradas"
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
        </q-table>
        <div class="row q-mt-md q-gutter-md justify-center">
          <q-btn color="primary" label="Descargar CSV" @click="exportToCSV" icon="download" />
          <q-btn color="primary" label="Descargar Excel" @click="exportToExcel" icon="download" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useQuasar } from 'quasar'
import { ref, computed, onMounted } from 'vue'

const filtroTipo = ref('Todos')
const fechaInicio = ref('')
const fechaFin = ref('')
const transacciones = ref([])

const $q = useQuasar()

const tipoOpciones = [
  { label: 'Depósitos', value: 'Deposito' },
  { label: 'Retiros', value: 'Retiro' },
  { label: 'Todas las transacciones', value: 'Todos' },
]

const columns = [
  { name: 'tipoTransaccion', label: 'Tipo', align: 'left', field: 'tipoTransaccion' },
  { name: 'monto', label: 'Monto', align: 'center' },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado' },
  {
    name: 'fechaHora',
    label: 'Fecha',
    align: 'center',
    field: 'fechaHora',
    format: (val) => formatFecha(val),
  },
]

function formatFecha(fechaIso) {
  const fecha = new Date(fechaIso)
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fecha)
}

const aplicarFiltros = async () => {
  try {
    const url = new URL('http://localhost:5077/api/v1/Transacciones/mis-transacciones')
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const token = userData.token

    if (!token) {
      $q.notify({ type: 'negative', message: 'No hay token disponible' })
      return
    }

    // ✅ Validación de fechas
    if (fechaInicio.value && fechaFin.value) {
      const inicio = new Date(fechaInicio.value)
      const fin = new Date(fechaFin.value)

      if (fin < inicio) {
        $q.notify({
          type: 'negative',
          message: 'La fecha de fin no puede ser menor que la fecha de inicio',
        })
        return
      }
    }

    if (filtroTipo.value !== 'Todos') {
      url.searchParams.append('estado', filtroTipo.value)
    }

    if (fechaInicio.value) url.searchParams.append('fechaInicio', fechaInicio.value)
    if (fechaFin.value) url.searchParams.append('fechaFin', fechaFin.value)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) throw new Error(`Error ${response.status}`)
    transacciones.value = await response.json()
    console.log('transacciones:', transacciones.value)
  } catch (err) {
    console.error('❌ Error al aplicar filtros:', err)
  }
}

function exportToCSV() {
  const csvContent = [
    ['Tipo', 'Monto', 'Estado', 'Fecha'],
    ...transacciones.value.map((row) => [
      row.tipoTransaccion,
      row.monto,
      row.estado,
      row.fechaHora,
    ]),
  ]
    .map((e) => e.join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, 'transacciones.csv')
}

function exportToExcel() {
  const exportData = transacciones.value.map((row) => ({
    Tipo: row.tipoTransaccion,
    Monto: row.monto,
    Estado: row.estado,
    Fecha: row.fechaHora,
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transacciones')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })
  saveAs(blob, 'transacciones.xlsx')
}

const transaccionesFiltradas = computed(() => {
  if (filtroTipo.value === 'Todos') return transacciones.value
  return transacciones.value.filter((t) => t.tipoTransaccion === filtroTipo.value)
})

const limpiarFiltros = async () => {
  filtroTipo.value = 'Todos'
  fechaInicio.value = ''
  fechaFin.value = ''

  await aplicarFiltros() // vuelve a cargar todo sin filtros
}

onMounted(() => {
  aplicarFiltros()
})
</script>
