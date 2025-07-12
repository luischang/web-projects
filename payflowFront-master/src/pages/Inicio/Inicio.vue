<template>
  <HeaderComponent />
  <div class="q-pa-md">
    <inicioPrincipal />
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
import inicioPrincipal from 'src/components/transacciones/inicioPrincipal.vue'
</script>

<style></style>
