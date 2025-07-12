<template>
  <div class="login-container">
    <img class="logo-top-right-global" src="src/assets/PayFlowS.jpg" alt="PayFlow Logo" />
    <div class="login-background">
      <div class="login-content">
        <q-card class="login-form" flat bordered>
          <q-form @submit.prevent="resetearPassword">
            <div class="input-container">
              <q-input
                filled
                dense
                type="email"
                id="email"
                v-model="email"
                label="Correo"
                placeholder="Introduce tu correo"
                :rules="[(val) => !!val || 'El correo es requerido']"
                color="primary"
                required
              />
            </div>
            <div class="input-container">
              <q-input
                filled
                dense
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                label="Contraseña"
                placeholder="Introduce tu nueva contraseña"
                :rules="[(val) => !!val || 'La contraseña es requerida']"
                color="primary"
                required
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>
            <div class="input-container">
              <q-input
                filled
                dense
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
                label="Confirmar contraseña"
                placeholder="Repite tu nueva contraseña"
                :rules="[
                  (val) => !!val || 'Confirma tu contraseña',
                  (val) => val === password || 'Las contraseñas no coinciden',
                ]"
                color="primary"
                required
              >
                <template v-slot:append>
                  <q-icon
                    :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showConfirmPassword = !showConfirmPassword"
                  />
                </template>
              </q-input>
            </div>
            <div class="error-message" v-if="errorMessage">
              {{ errorMessage }}
            </div>
            <q-btn type="submit" label="Resetear contraseña" />
          </q-form>
          <div class="extra-links">
            <q-btn
              flat
              dense
              label="Registrarse"
              class="text-white"
              color="primary"
              @click="$router.push('/register')"
            />
            <q-btn
              flat
              dense
              label="Ingresar"
              class="text-white"
              color="primary"
              @click="$router.push('/login')"
            />
            <q-btn flat dense label="Ayuda" class="text-white" color="primary" />
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para el fondo principal */
.login-container {
  position: relative;
  height: 100vh;
  background-image: url('src/assets/machu-picchu.jpg');
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Estilos para el fondo del formulario de login */
.login-background {
  position: relative;
  padding: 40px;
  border-radius: 0px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

/*Modificar Logo*/
.logo-top-right-global {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 150px;
  z-index: 1000;
}

/* Estilos para el formulario de login */
.login-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

/* Estilos para el formulario de login */
.input-container {
  margin-bottom: 15px;
  text-align: center;
  width: 80%;
  margin: 0 auto;
}

.q-input {
  width: 100%;
}

.q-card.login-form {
  border-top: 30px solid #ffffff;
  margin-right: 16px;
}

button {
  width: 80%;
  padding: 10px;
  background-color: #18077b;
  color: white;
  font-size: 16px;
  border-radius: 0px;
  border: none;
  cursor: pointer;
  font-size: 12px; /* Ajustar el tamaño de fuente ingresar/registrame/etc */
}

button:hover {
  background-color: #18077b;
}

.extra-links {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  font-size: px;
}

.extra-links a {
  color: white;
  text-decoration: none;
}

.error-message {
  color: red;
  margin-bottom: 10px;
  font-size: 14px;
}
</style>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      showPassword: false,
      showConfirmPassword: false,
    }
  },
  methods: {
    resetearPassword() {
      let endpointUrl = '/api/v1/usuarios/reset-password'
      let userData = {
        correoElectronico: this.email,
        nuevaContraseña: this.password,
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden'
        return
      }
      this.$api
        .post(endpointUrl, userData)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: 'Contraseña restablecida exitosamente',
          })
          this.errorMessage = ''
          this.$router.push('/Login')
        })
        .catch((error) => {
          // Mostrar mensaje específico del backend si existe
          const backendMsg = error?.response?.data?.message
          if (backendMsg) {
            this.errorMessage = backendMsg
            this.$q.notify({
              type: 'negative',
              message: backendMsg,
            })
          } else {
            this.errorMessage = 'Error al resetear contraseña.'
            this.$q.notify({
              type: 'negative',
              message: 'Error al resetear contraseña.',
            })
          }
        })
    },
  },
}
</script>
