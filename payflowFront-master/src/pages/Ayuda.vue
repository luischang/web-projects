<template>
  <HeaderComponent />
  <div class="ayuda-bg">
    <q-card class="ayuda-card">
      <div class="ayuda-title">Centro de ayuda</div>
      <div class="ayuda-search-container">
        <q-input
          outlined
          rounded
          dense
          placeholder="¿En qué podemos ayudarte?"
          class="ayuda-search ayuda-search-outlined"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="ayuda-faq-title">Preguntas frecuentes</div>
      <q-expansion-item label="¿Cómo recupero mi contraseña?" class="ayuda-faq-item">
        <div>
          Para recuperar tu contraseña, debes hacer clic en la opción "Olvidé mi contraseña". Luego,
          se te pedirá ingresar una nueva contraseña y confirmarla. Finalmente, haz clic en
          "Restablecer contraseña" para completar el proceso.
        </div>
      </q-expansion-item>
      <q-expansion-item label="¿Qué pasa si subo un voucher incorrecto?" class="ayuda-faq-item">
        <div>
          Si subes un voucher incorrecto, tu operación podría ser rechazada. Verifica siempre la
          información antes de enviarla.
        </div>
      </q-expansion-item>
      <q-expansion-item
        label="¿Dónde puedo ver mis transacciones anteriores?"
        class="ayuda-faq-item"
      >
        <div>
          Puedes ver tus transacciones anteriores en la sección "Transacciones" del menú principal.
        </div>
      </q-expansion-item>
      <q-expansion-item label="¿Cómo realizo un depósito correctamente?" class="ayuda-faq-item">
        <div>
          Sigue las instrucciones de la sección de depósitos y asegúrate de subir el comprobante
          correcto.
        </div>
      </q-expansion-item>
      <q-expansion-item label="¿Por qué no puedo retirar fondos?" class="ayuda-faq-item">
        <div>
          Verifica que cumplas con los requisitos y que no existan restricciones en tu cuenta.
        </div>
      </q-expansion-item>
      <div class="ayuda-btns">
        <q-btn class="ayuda-btn ayuda-btn-small" label="Política de privacidad" />
        <q-btn class="ayuda-btn ayuda-btn-small" label="Términos y condiciones" />
        <q-btn class="ayuda-btn ayuda-btn-small" label="Volver al inicio" to="/inicio" />
      </div>
    </q-card>
  </div>
</template>

<script>
import HeaderComponent from 'components/Header/HeaderComponent.vue'
export default {
  name: 'AyudaPage',
  components: { HeaderComponent },
}
</script>

<style scoped>
.ayuda-bg {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
}
.ayuda-card {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 24px 24px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px 0 rgba(24, 7, 123, 0.12);
  border: 2px solid #1976d2;
}
.ayuda-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2a1a8c;
  text-align: center;
  margin-bottom: 16px;
  font-family: 'Montserrat', sans-serif;
}
.ayuda-search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
}
.ayuda-search {
  width: 100%;
  max-width: 350px;
  margin-bottom: 4px;
}
.ayuda-search-outlined .q-field__control {
  border: 2px solid #18077b !important;
}
.ayuda-faq-title {
  font-weight: bold;
  margin: 16px 0 8px 0;
  font-size: 1.1rem;
}
.ayuda-faq-item {
  margin-bottom: 8px;
}
.ayuda-faq-label {
  font-weight: bold;
  display: block;
  margin-bottom: 2px;
}
.ayuda-btns {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}
.ayuda-btn-small {
  min-width: 180px;
  font-size: 0.95rem;
  padding: 6px 0;
  height: 36px;
}
.ayuda-btn {
  background: #18077b !important;
  color: #fff !important;
  font-weight: bold;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(26, 35, 126, 0.07);
}
</style>
