<template>
  <q-dialog v-model="show" persistent>
    <q-card
      class="q-pa-lg"
      style="min-width: 350px; max-width: 400px; border: 1px solid #7e57c2; border-radius: 12px"
    >
      <div class="steps-indicator row items-center justify-center q-mb-md">
        <div v-if="step === 3" class="step-item text-center"></div>
      </div>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-bold" style="color: #23235b">Depositar</div>
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
          <div v-if="step === 1" class="step-circle step-active">1</div>
          <div v-else class="step-circle step-inactive">1</div>
        </div>
        <div class="step-item text-center">
          <div v-if="step === 2" class="step-circle step-active">2</div>
          <div v-else class="step-circle step-inactive">2</div>
        </div>
        <div class="step-item text-center">
          <div v-if="step === 3" class="step-circle step-active">3</div>
          <div v-else class="step-circle step-inactive">3</div>
        </div>
      </div>
      <div v-if="step === 1">
        <q-input v-model="form.banco" label="Banco" outlined class="q-mb-md shadow-2" />
        <q-input
          v-model="form.numeroOperacion"
          label="Número de operación"
          outlined
          class="q-mb-md shadow-2"
        />
        <q-input
          v-model="form.monto"
          label="Monto"
          prefix="S/."
          outlined
          class="q-mb-md shadow-2"
          type="number"
        />
        <q-uploader
          v-model="form.archivo"
          label="Adjuntar voucher (PNG, JPG, PDF)"
          accept="image/png, image/jpeg, application/pdf"
          :auto-upload="false"
          :max-files="1"
          class="q-mb-md"
          @added="onFileAdded"
        />
        <q-btn color="primary" class="full-width text-bold q-mt-md" @click="goToStep2"
          >Siguiente</q-btn
        >
      </div>
      <div v-else-if="step === 2">
        <div class="text-center text-green q-mb-md">Confirmación de depósito</div>
        <div class="q-mb-sm">
          <span class="text-grey-8">Banco:</span> <span class="text-bold">{{ form.banco }}</span>
        </div>
        <div class="q-mb-sm">
          <span class="text-grey-8">Número de operación:</span>
          <span class="text-bold">{{ form.numeroOperacion }}</span>
        </div>
        <div class="q-mb-sm">
          <span class="text-grey-8">Monto:</span>
          <span class="text-bold">S/. {{ Number(form.monto).toFixed(2) }}</span>
        </div>
        <div v-if="filePreview" class="q-mb-md">
          <div class="q-mb-xs text-grey-8">Voucher adjunto:</div>
          <div v-if="fileType.startsWith('image/')">
            <img
              :src="filePreview"
              alt="Vista previa"
              style="
                max-width: 120px;
                max-height: 120px;
                border-radius: 6px;
                border: 1px solid #eee;
              "
            />
          </div>
          <div v-else-if="fileType === 'application/pdf'">
            <q-icon name="picture_as_pdf" color="red" size="32px" />
            <span class="q-ml-sm">PDF adjunto</span>
          </div>
        </div>
        <q-btn
          color="primary"
          class="full-width text-bold q-mt-md"
          :loading="loading"
          @click="depositar"
          >Depositar</q-btn
        >
      </div>
      <div v-else-if="step === 3">
        <div class="steps-indicator row items-center justify-center q-mb-md">
          <q-icon name="check" color="primary" size="36px" class="step-check q-mb-md" />
        </div>
        <div class="text-center text-green text-bold q-mb-md" style="font-size: 1.2em">
          ¡Depósito exitoso!
        </div>
        <div class="q-mb-xs text-grey-8">
          Banco: <span class="text-bold">{{ form.banco }}</span>
        </div>
        <div class="q-mb-xs text-grey-8">
          Monto: <span class="text-bold">S/. {{ Number(form.monto).toFixed(2) }}</span>
        </div>
        <div class="q-mb-xs text-grey-8">
          Fecha: <span class="text-bold">{{ operacion.fecha }}</span> Hora:
          <span class="text-bold">{{ operacion.hora }}</span>
        </div>
        <div class="q-mb-xs text-grey-8">
          Código de operación: <span class="text-bold">{{ operacion.codigo }}</span>
        </div>
        <div class="q-mt-md">
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
        </div>
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
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
const $api = api

const show = defineModel() // v-model:show from parent
const step = ref(1)
const loading = ref(false)
const form = ref({ banco: '', numeroOperacion: '', monto: '', archivo: [] })
const operacion = ref({ codigo: '', fecha: '', hora: '' })
const filePreview = ref(null)
const fileType = ref('')
const archivoSeleccionado = ref(null)
const $q = useQuasar()

function goToStep2() {
  if (!form.value.banco || !form.value.numeroOperacion || !form.value.monto) {
    $q.notify({ type: 'negative', message: 'Completa todos los campos.' })
    return
  }
  step.value = 2
}

function onFileAdded(files) {
  if (files && files.length > 0) {
    archivoSeleccionado.value = files[0]
    fileType.value = files[0].type
    // Mostrar en consola el archivo seleccionado
    console.log('Archivo seleccionado:', files[0])
    if (files[0].type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        filePreview.value = e.target.result
      }
      reader.readAsDataURL(files[0])
    } else if (files[0].type === 'application/pdf') {
      filePreview.value = null // No preview, just icon
    }
  } else {
    archivoSeleccionado.value = null
    filePreview.value = null
    fileType.value = ''
  }
}

async function depositar() {
  loading.value = true
  try {
    let endpointUrl = '/api/depositos/registrar'
    // Obtener token como en MiPerfil.vue
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
      throw new Error('No se encontró el token de autenticación')
    }
    // Construcción robusta y simplificada del FormData
    const formData = new FormData()
    formData.append('Monto', form.value.monto || '')
    formData.append('Banco', form.value.banco || '')
    formData.append('Comentario', form.value.numeroOperacion || '')
    formData.append('ComentariosAdmin', '')
    formData.append('CuentaDestinoID', '')
    formData.append('IPOrigen', '')
    formData.append('Ubicacion', '')
    // Usar archivoSeleccionado
    let archivo = archivoSeleccionado.value
    if (
      archivo &&
      typeof archivo.name === 'string' &&
      typeof archivo.size === 'number' &&
      typeof archivo.type === 'string' &&
      typeof archivo.slice === 'function'
    ) {
      formData.append('RutaVoucher', archivo)
      console.log('Archivo real a enviar:', archivo)
    } else {
      console.warn('No se encontró un File válido en el uploader')
    }
    // DEBUG: Mostrar el contenido de FormData en consola
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1])
    }
    const response = await $api.post(endpointUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // No pongas Content-Type manualmente
      },
    })
    // Capturar datos reales del backend
    const deposito = response.data && response.data.deposito
    let fecha = '',
      hora = '',
      codigo = ''
    if (deposito) {
      const fechaObj = new Date(deposito.fechaTransaccion)
      fecha = fechaObj.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      hora = fechaObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      codigo = deposito.numeroOperacion || ''
    }
    operacion.value = {
      codigo,
      fecha,
      hora,
    }
    step.value = 3
  } catch (error) {
    // Mostrar el error detallado del backend
    if (error.response && error.response.data) {
      console.error('Error detalle backend:', error.response.data)
    }
    console.error('Error al enviar solicitud:', error.response)
    $q.notify({ type: 'negative', message: 'Error al depositar.' })
  } finally {
    loading.value = false
  }
}

function volverInicio() {
  show.value = false
  step.value = 1
  form.value = { banco: '', numeroOperacion: '', monto: '' }
}

function realizarOtraOperacion() {
  step.value = 1
  form.value = { banco: '', numeroOperacion: '', monto: '' }
}

function enviarConstancia() {
  $q.notify({ type: 'info', message: 'Constancia enviada.' })
}

function descargarConstancia() {
  $q.notify({ type: 'info', message: 'Descargando constancia...' })
}

function closeModal() {
  show.value = false
  step.value = 1
  form.value = { banco: '', numeroOperacion: '', monto: '' }
}
</script>

<script>
export default {
  name: 'DepositoModal', // Cambia el nombre del componente a multi-palabra
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
</style>
