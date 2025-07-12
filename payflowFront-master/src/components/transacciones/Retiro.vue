<template>
  <q-dialog v-model="show" persistent>
    <q-card class="q-pa-lg retiro-card" style="min-width: 320px; max-width: 360px">
      <div class="steps-indicator row items-center justify-center q-mb-md"></div>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-bold" style="color: #23235b">Realizar Retiro</div>
        <q-btn
          dense
          flat
          icon="close"
          @click="closeModal"
          class="q-ml-auto"
          style="min-width: 32px"
        />
      </div>
      <div class="steps-numbers row items-center justify-between q-mb-md">
        <div class="step-item text-center">
          <div :class="['step-circle', step === 1 ? 'step-active' : 'step-inactive']">1</div>
        </div>
        <div class="step-item text-center">
          <div :class="['step-circle', step === 2 ? 'step-active' : 'step-inactive']">2</div>
        </div>
        <div class="step-item text-center">
          <div :class="['step-circle', step === 3 ? 'step-active' : 'step-inactive']">3</div>
        </div>
      </div>
      <div v-if="step === 1">
        <q-input
          v-model="form.cuentaOrigen"
          label="Cuenta de cargo"
          outlined
          class="q-mb-md shadow-2"
          maxlength="10"
          :rules="[
            (val) => !!val || 'La cuenta es requerida',
            (val) => /^\d{10}$/.test(val) || 'Debe tener 10 dígitos',
          ]"
          readonly
        />
        <q-input
          v-model.number="form.montoRetiro"
          label="Monto (S/.)"
          outlined
          class="q-mb-md shadow-2"
          type="number"
          min="0"
          :rules="[
            (val) => !!val || 'El monto es requerido',
            (val) => val > 0 || 'El monto debe ser mayor a cero',
            (val) => val <= userBalance || 'Saldo insuficiente',
          ]"
        />
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
        <q-btn color="primary" class="full-width text-bold q-mt-md" @click="goToConfirmStep"
          >Siguiente</q-btn
        >
      </div>
      <div v-else-if="step === 2">
        <div class="text-center text-green q-mb-md">Confirmación de retiro</div>
        <div class="confirm-labels">
          <p>
            <span class="label">Cuenta de cargo:</span>
            <span class="value">{{ form.cuentaOrigen }}</span>
          </p>
          <p>
            <span class="label">Monto:</span>
            <span class="amount">S/. {{ Number(form.montoRetiro).toFixed(2) }}</span>
          </p>
        </div>
        <q-btn
          color="primary"
          class="full-width text-bold q-mt-md"
          :loading="loading"
          @click="handleRetiro"
          >Confirmar</q-btn
        >
      </div>
      <div v-else-if="step === 3">
        <div class="steps-indicator row items-center justify-center q-mb-md">
          <q-icon name="check_circle" color="green" size="36px" class="step-check q-mb-md" />
        </div>
        <div class="text-center text-green text-bold q-mb-md" style="font-size: 1.2em">
          ¡Retiro exitoso!
        </div>
        <div class="confirm-labels">
          <p>
            <span class="label">Código de operación:</span>
            <span class="value">{{ operacionExitosa.codigo }}</span>
          </p>
          <p>
            <span class="label">Fecha:</span>
            <span class="value">{{ operacionExitosa.fecha }}</span>
            <span class="label">Hora:</span> <span class="value">{{ operacionExitosa.hora }}</span>
          </p>
          <p>
            <span class="label">Cuenta de cargo:</span>
            <span class="value">{{ form.cuentaOrigen }}</span>
          </p>
          <p>
            <span class="label">Monto:</span>
            <span class="amount">S/. {{ Number(form.montoRetiro).toFixed(2) }}</span>
          </p>
        </div>
        <q-btn flat color="green" class="text-bold full-width q-mb-xs" @click="enviarConstancia"
          >ENVIAR CONSTANCIA</q-btn
        >
        <q-btn
          flat
          color="primary"
          class="text-bold full-width q-mb-md"
          @click="descargarConstancia"
          >DESCARGAR CONSTANCIA</q-btn
        >
        <q-btn color="primary" class="full-width text-bold q-mt-md" @click="volverInicio"
          >Volver al inicio</q-btn
        >
        <q-btn
          color="primary"
          outline
          class="full-width text-bold q-mt-sm"
          @click="realizarOtraOperacion"
          >Realizar otra operación</q-btn
        >
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
defineOptions({ name: 'TransaccionRetiro' })
import { ref, defineModel, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
const show = defineModel()
const emit = defineEmits(['operacion-exitosa'])
const step = ref(1)
const loading = ref(false)
const userBalance = 2000
const form = ref({ cuentaOrigen: '', montoRetiro: null })
const errorMessage = ref('')
const operacionExitosa = ref({ codigo: '', fecha: '', hora: '' })
const $q = useQuasar()

// Obtener número de cuenta al iniciar el componente
onMounted(async () => {
  try {
    let token = localStorage.getItem('token')
    if (!token) {
      // Intentar obtener el token desde userData si no existe en localStorage directamente
      const userData = localStorage.getItem('userData')
      if (userData) {
        const parsed = JSON.parse(userData)
        token = parsed.token
      }
    }
    if (!token) {
      throw new Error('No se encontró token de autenticación.')
    }
    const response = await api.get('/api/v1/Transacciones/resumen-inicio', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const numeroCuenta = response.data.numeroCuenta || 'No disponible'
    form.value.cuentaOrigen = numeroCuenta
  } catch (error) {
    console.error('Error al obtener número de cuenta:', error)
    $q.notify({ type: 'negative', message: 'Error al obtener número de cuenta' })
  }
})

function goToConfirmStep() {
  errorMessage.value = ''
  if (!form.value.cuentaOrigen || !/^\d{10}$/.test(form.value.cuentaOrigen)) {
    errorMessage.value = 'La cuenta debe tener 10 dígitos numéricos.'
    return
  }
  if (!form.value.montoRetiro || form.value.montoRetiro <= 0) {
    errorMessage.value = 'El monto debe ser mayor a cero.'
    return
  }
  if (form.value.montoRetiro > userBalance) {
    errorMessage.value = 'Saldo insuficiente.'
    return
  }
  step.value = 2
}

async function handleRetiro() {
  loading.value = true
  errorMessage.value = ''
  try {
    let token = localStorage.getItem('token')
    if (!token) {
      // Intentar obtener el token desde userData si no existe en localStorage directamente
      const userData = localStorage.getItem('userData')
      if (userData) {
        const parsed = JSON.parse(userData)
        token = parsed.token
      }
    }
    if (!token) {
      throw new Error('No se encontró token de autenticación.')
    }
    const payload = {
      monto: form.value.montoRetiro,
    }
    const response = await api.post('/api/v1/Retiros', payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const { codigoOperacion, fechaHoraOperacion, nuevoSaldo } = response.data
    let fecha = '',
      hora = ''
    if (
      fechaHoraOperacion &&
      typeof fechaHoraOperacion === 'string' &&
      fechaHoraOperacion.includes(' ')
    ) {
      ;[fecha, hora] = fechaHoraOperacion.split(' ')
    } else {
      fecha = ''
      hora = ''
    }
    operacionExitosa.value = {
      codigo: codigoOperacion,
      fecha: fecha,
      hora: hora,
    }
    step.value = 3
    $q.notify({ type: 'positive', message: 'Retiro realizado con éxito.' })
    emit('operacion-exitosa', {
      codigo: codigoOperacion,
      monto: form.value.montoRetiro,
      tipo: 'Retiro',
      nuevoSaldo,
    })
  } catch (error) {
    let backendMsg = 'Error al realizar el retiro: ' + (error.message || 'Error desconocido')
    if (error.response && error.response.data && error.response.data.message) {
      backendMsg = 'Error al realizar el retiro: ' + error.response.data.message
    }
    $q.notify({
      type: 'negative',
      message: backendMsg,
    })
  } finally {
    loading.value = false
  }
}

function closeModal() {
  show.value = false
  step.value = 1
  form.value = { cuentaOrigen: '', montoRetiro: null }
  errorMessage.value = ''
}

function enviarConstancia() {
  $q.notify({ type: 'info', message: 'Constancia enviada.' })
}

function descargarConstancia() {
  $q.notify({ type: 'info', message: 'Descargando constancia...' })
}

function volverInicio() {
  closeModal()
}

function realizarOtraOperacion() {
  step.value = 1
  form.value = { cuentaOrigen: '', montoRetiro: null }
  errorMessage.value = ''
}
</script>

<style scoped>
/* Estilos del componente */
</style>
