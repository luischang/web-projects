<template>
  <HeaderComponent />
  <div class="q-pa-md">
    <MisTransacciones />
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
import MisTransacciones from 'src/components/transacciones/misTransacciones.vue'
</script>
