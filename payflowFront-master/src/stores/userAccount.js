import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useUserAccountStore = defineStore('userAccount', () => {
  const saldo = ref(null)
  const numeroCuenta = ref('')
  const loading = ref(false)

  async function fetchAccount() {
    const token = localStorage.getItem('token')
    const usuarioId = localStorage.getItem('usuarioId')
    if (!token || !usuarioId) return

    loading.value = true
    try {
      const res = await axios.get(`/api/v1/cuentas/usuario/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      saldo.value = res.data.saldo
      numeroCuenta.value = res.data.numeroCuenta
    } finally {
      loading.value = false
    }
  }

  return { saldo, numeroCuenta, loading, fetchAccount }
})
