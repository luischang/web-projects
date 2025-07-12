<template>
  <div class="q-pa-md">
    <h5 class="q-mb-md">Validación automática</h5>

    <q-form class="q-gutter-md">
      <q-input filled v-model="cliente" label="Cliente" />
      <q-input filled v-model="documento" label="Nro Documento" />
    </q-form>

    <div class="q-mt-lg">
      <q-card flat bordered class="q-pa-md">
        <q-card-section>
          <q-layout view="hHh lpR fFf">
            <q-page-container>
              <div class="row q-col-gutter-md">
                <!-- Columna izquierda: Vista previa del voucher -->
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-sm">Vista previa del voucher</div>
                  <q-img
                    :src="vistaPreviaUrl"
                    spinner-color="primary"
                    class="q-mb-md full-width"
                    style="max-width: 700px; object-fit: scale-down"
                    v-if="vistaPreviaUrl"
                  />
                  <q-uploader
                    ref="uploader"
                    accept=".png, .jpg, .jpeg, .webp"
                    label="Subir voucher"
                    :auto-upload="false"
                    @added="procesarImagen"
                    style="max-width: 100%"
                  />
                </div>

                <!-- Columna derecha: Texto detectado -->
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 q-mb-sm">Texto detectado</div>
                  <q-card class="q-pa-md bg-grey-2" style="min-height: 400px">
                    <pre style="white-space: pre-wrap">{{ textoDetectado }}</pre>
                  </q-card>
                </div>
              </div>
            </q-page-container>
          </q-layout>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Tesseract from 'tesseract.js'

const cliente = ref('')
const documento = ref('')
const textoDetectado = ref('')
const vistaPreviaUrl = ref('')

function procesarImagen(archivos) {
  const imagen = archivos[0]
  if (!imagen) return

  vistaPreviaUrl.value = URL.createObjectURL(imagen)
  textoDetectado.value = 'Procesando...'

  Tesseract.recognize(imagen, 'spa', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`[OCR] Progreso: ${Math.floor(m.progress * 100)}%`)
      }
    },
  })
    // .then(({ data: { text } }) => {
    //   // Reemplazos para mejorar reconocimiento de montos
    //   const textoLimpio = text

    //     .replace(/\$1\s*/g, 'S/ ') // $1 41.80 o $1.41.80 → S/ 41.80
    //     .replace(/5\/\s*/g, 'S/ ') // 5/ 41.80 → S/ 41.80
    //     .replace(/S\s*\/\s*/g, 'S/ ') // S / 41.80 → S/ 41.80
    //     .replace(/(?<!S)\/(\d)/g, 'S/ $1') // /41.80 → S/ 41.80 si no hay S antes
    //     .replace(/S\/\s*\.\s*/g, 'S/ 0.') // S/ . → S/ 0.
    //     .replace(/S\/\s*(\d)\.(\d{2})\.(\d{2})/, 'S/ $1$2.$3') // S/ 1.41.80 → S/ 141.80

    //   textoDetectado.value = textoLimpio
    // })
    .then(({ data: { text } }) => {
      // Procesamos línea por línea y corregimos solo la de 'Monto'
      const textoLimpio = text
        .split('\n')
        .map((linea) => {
          if (linea.toLowerCase().includes('monto')) {
            return linea
              .replace(/\$1\s*/g, 'S/ ')
              .replace(/5\/\s*/g, 'S/ ')
              .replace(/S\s*\/\s*/g, 'S/ ')
              .replace(/(?<!S)\/(\d)/g, 'S/ $1')
              .replace(/S\/\s*\.\s*/g, 'S/ 0.')
              .replace(/S\/\s*(\d)\.(\d{2})\.(\d{2})/, 'S/ $1$2.$3')
          }
          return linea
        })
        .join('\n')

      textoDetectado.value = textoLimpio
    })

    .catch((error) => {
      textoDetectado.value = 'Error al procesar la imagen'
      console.error(error)
    })
}
</script>
