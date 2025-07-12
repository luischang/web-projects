<template>
  <q-dialog v-model="show" persistent>
    <q-card
      class="q-pa-lg"
      style="min-width: 350px; max-width: 400px; border: 1px solid #7e57c2; border-radius: 12px"
    >
      <div class="steps-indicator row items-center justify-center q-mb-md"></div>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-bold" style="color: #23235b">Realizar Transferencia</div>
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
          v-model="form.cuentaDestinoManual"
          label="Cuenta de abono"
          outlined
          class="q-mb-md shadow-2"
          maxlength="10"
          :rules="[
            (val) => !!val || 'La cuenta de abono es requerida',
            (val) => /^\d{10}$/.test(val) || 'Debe tener 10 dígitos',
          ]"
        />
        <q-input
          v-model.number="form.amount"
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
        <div class="text-center text-green q-mb-md">Confirmación de transferencia</div>
        <div class="confirm-labels">
          <p>
            <span class="label">Cuenta de cargo:</span>
            <span class="value">{{ userAccountNumber }}</span>
          </p>
          <p>
            <span class="label">Cuenta de destino:</span>
            <span class="value">{{ form.cuentaDestinoManual }}</span>
          </p>
          <p>
            <span class="label">Monto:</span>
            <span class="amount">S/. {{ Number(form.amount).toFixed(2) }}</span>
          </p>
        </div>
        <q-btn
          color="primary"
          class="full-width text-bold q-mt-md"
          :loading="loading"
          @click="handleTransfer"
          >Confirmar</q-btn
        >
      </div>
      <div v-else-if="step === 3">
        <div class="steps-indicator row items-center justify-center q-mb-md">
          <q-icon name="check_circle" color="green" size="36px" class="step-check q-mb-md" />
        </div>
        <div class="text-center text-green text-bold q-mb-md" style="font-size: 1.2em">
          ¡Transferencia exitosa!
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
            <span class="value">{{ userAccountNumber }}</span>
          </p>
          <p>
            <span class="label">Cuenta de destino:</span>
            <span class="value">{{ form.cuentaDestinoManual }}</span>
          </p>
          <p>
            <span class="label">Monto:</span>
            <span class="amount">S/. {{ Number(form.amount).toFixed(2) }}</span>
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
defineOptions({ name: 'TransaccionTransferencia' })
import { ref, defineModel, onMounted } from 'vue'
import { useQuasar } from 'quasar'
const show = defineModel()
const step = ref(1)
const loading = ref(false)
const userBalance = ref(2000)
const userAccountNumber = ref('')
const form = ref({ cuentaDestinoManual: '', amount: null })
const errorMessage = ref('')
const operacionExitosa = ref({ codigo: '', fecha: '', hora: '' })
const $q = useQuasar()

onMounted(async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const token = userData.token
    if (!token) return
    const response = await fetch('http://localhost:5077/api/v1/Transacciones/resumen-inicio', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('No se pudo obtener la cuenta')
    const data = await response.json()
    userAccountNumber.value = data.numeroCuenta || ''
    // Si el backend provee saldo, usarlo
    if (data.saldo) userBalance.value = data.saldo
  } catch (err) {
    console.error('Error obteniendo cuenta:', err)
    $q.notify({ type: 'negative', message: 'No se pudo obtener la cuenta de cargo' })
  }
})

function goToConfirmStep() {
  errorMessage.value = ''
  if (!form.value.cuentaDestinoManual || !/^\d{10}$/.test(form.value.cuentaDestinoManual)) {
    errorMessage.value = 'La cuenta de abono debe tener 10 dígitos numéricos.'
    return
  }
  if (!form.value.amount || form.value.amount <= 0) {
    errorMessage.value = 'El monto debe ser mayor a cero.'
    return
  }
  if (form.value.amount > userBalance.value) {
    errorMessage.value = 'Saldo insuficiente.'
    return
  }
  step.value = 2
}

async function handleTransfer() {
  loading.value = true
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}')
    const token = userData.token
    if (!token) throw new Error('No hay token')
    const payload = {
      cuentaDestinoNumero: form.value.cuentaDestinoManual,
      monto: form.value.amount,
    }
    const response = await fetch('http://localhost:5077/api/Transferencias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('Error en la transferencia')
    const data = await response.json()
    const now = new Date()
    operacionExitosa.value = {
      codigo: data.numeroOperacion || Math.floor(Math.random() * 9000000 + 1000000).toString(),
      fecha: now.toLocaleDateString('es-PE'),
      hora: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    }
    // Actualizar saldo disponible tras la transferencia
    await actualizarSaldoDisponible(token)
    step.value = 3
    $q.notify({ type: 'positive', message: 'Transferencia realizada con éxito.' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al realizar la transferencia' })
    console.error('Transferencia error:', err)
  } finally {
    loading.value = false
  }
}

async function actualizarSaldoDisponible(token) {
  try {
    const response = await fetch('http://localhost:5077/api/v1/Transacciones/resumen-inicio', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('No se pudo actualizar el saldo')
    const data = await response.json()
    if (data.saldo !== undefined) userBalance.value = data.saldo
  } catch (err) {
    console.error('Error actualizando saldo:', err)
    $q.notify({ type: 'warning', message: 'No se pudo actualizar el saldo disponible' })
  }
}

function closeModal() {
  show.value = false
  step.value = 1
  form.value = { cuentaDestinoManual: '', amount: null }
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
  form.value = { cuentaDestinoManual: '', amount: null }
  errorMessage.value = ''
}
</script>

<style scoped>
.q-dialog__inner {
  align-items: center;
}
.q-card {
  box-shadow: 0 2px 8px 0 #e0e0e0;
}
.text-green {
  color: #00b300 !important;
}
.text-bold {
  font-weight: bold;
}
.q-btn.full-width {
  width: 100%;
}
.steps-indicator {
  min-height: 36px;
  margin-bottom: 0;
}
.steps-numbers {
  margin-bottom: 24px;
}
.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 2px;
}
.step-active {
  background: #3f51b5;
  color: #fff;
}
.step-inactive {
  background: #f0f0f0;
  color: #bbb;
}
.step-check {
  font-size: 2.2rem;
  margin-bottom: 2px;
}
.confirm-labels {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 16px;
}
.confirm-labels p {
  margin-bottom: 8px;
}
.confirm-labels .label {
  font-weight: 500;
  color: #888;
  display: inline-block;
  width: 140px;
}
.confirm-labels .value {
  font-weight: bold;
  color: #222;
}
.confirm-labels .amount {
  color: #18077b;
}
.error-message {
  color: red;
  margin-bottom: 10px;
  font-size: 14px;
}
</style>
