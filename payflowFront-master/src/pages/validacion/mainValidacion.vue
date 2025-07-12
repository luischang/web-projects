<template>
  <HeaderComponent />
  <div class="q-pa-md">
    <validacionOCR />
  </div>
</template>

<script>
import HeaderComponent from 'components/Header/HeaderComponent.vue'
export default {
  name: 'InicioPage',
  components: { HeaderComponent },
}
</script>

<script setup>
import validacionOCR from 'src/components/validaciones/validacionAutomatica.vue'
</script>
