<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row q-col-gutter-xl">
      <!-- Filtro y búsqueda -->
      <div class="col-3">
        <div class="q-pa-md shadow-2 bg-white rounded-borders">
          <div class="text-subtitle1 q-mb-md"><b>Filtrar por</b></div>
          <q-option-group
            v-model="filtro"
            :options="filtroOptions"
            color="primary"
            type="radio"
            class="q-mb-lg"
          />
          <div class="text-subtitle1 q-mb-xs"><b>Fecha de registro</b></div>
          <q-input v-model="fechaInicio" type="date" dense outlined class="q-mb-sm" />
          <q-input v-model="fechaFin" type="date" dense outlined class="q-mb-lg" />
          <div class="text-subtitle1 q-mb-xs"><b>Buscar</b> <span class="text-caption">(nombres y apellidos, correo electrónico, DNI)</span></div>
          <q-input v-model="busqueda" dense outlined placeholder="" />
        </div>
      </div>
      <!-- Tabla -->
      <div class="col-9">
        <div class="q-pa-md shadow-2 bg-white rounded-borders">
          <div class="text-h6 text-center q-mb-md">Usuarios</div>
          <q-table
            :rows="paginados"
            :columns="columns"
            row-key="dni"
            flat
            dense
            v-model:pagination="pagination"
            :rows-per-page-options="[5, 10, 20]"
            hide-bottom
            class="my-table"
            :virtual-scroll="false"
          >
            <template v-slot:body-cell-dni="props">
              <q-td :props="props">
                <a href="#" class="text-primary text-weight-bold">{{ props.row.dni }}</a>
              </q-td>
            </template>
          </q-table>
          <!-- Paginación -->
          <div class="row justify-center q-mt-md">
            <q-pagination
              v-model="pagination.page"
              :max="maxPage"
              max-pages="5"
              color="primary"
              input
              direction-links
              boundary-links
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'UsuariosPage',
  data() {
    return {
      filtro: 'Activo',
      filtroOptions: [
        { label: 'Activos', value: 'Activo' },
        { label: 'Bloqueados', value: 'Bloqueado' },
        { label: 'Inactivos', value: 'Inactivo' }
      ],
      fechaInicio: '',
      fechaFin: '',
      busqueda: '',
      pagination: {
        page: 1,
        rowsPerPage: 5
      },
      columns: [
        { name: 'dni', label: 'DNI', align: 'left', field: 'dni', sortable: true },
        { name: 'nombre', label: 'Nombre', align: 'left', field: 'nombre', sortable: true },
        { name: 'correo', label: 'Correo electrónico', align: 'left', field: 'correo', sortable: true },
        { name: 'fecha', label: 'Fecha de registro', align: 'left', field: 'fecha', sortable: true },
        { name: 'estado', label: 'Estado de la cuenta', align: 'left', field: 'estado', sortable: true }
      ],
      usuarios: []
    }
  },
  computed: {
    paginados() {
      const total = this.usuarios.length;
      let page = this.pagination.page;
      const rowsPerPage = this.pagination.rowsPerPage;
      const maxPage = Math.ceil(total / rowsPerPage) || 1;
      if (page > maxPage) page = maxPage;
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      return this.usuarios.slice(start, end);
    },
    maxPage() {
      return Math.ceil(this.usuarios.length / this.pagination.rowsPerPage) || 1;
    }
  },
  mounted() {
    this.obtenerUsuarios();
  },
  methods: {
    async obtenerUsuarios() {
      this.loading = true;
      try {
        let endpointURL = "/api/v1/Usuarios";
        const params = { filtro: this.filtro };
        if (this.busqueda && this.busqueda.length > 3) {
          params.busqueda = this.busqueda;
        }
        if (this.fechaInicio) {
          params.fechaInicio = this.fechaInicio;
        }
        if (this.fechaFin) {
          params.fechaFin = this.fechaFin;
        }
        const response = await this.$api.get(endpointURL, { params });
        this.usuarios = response.data.map(item => ({
          dni: item.dni || '',
          nombre: ((item.nombres || '') + ' ' + (item.apellidos || '')).trim(),
          correo: item.correoElectronico || '',
          fecha: item.fechaRegistro || '',
          estado: item.estadoUsuario || ''
        }));
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        this.usuarios = [];
        this.$q.notify({ type: 'negative', message: 'Error al cargar usuarios' });
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    filtro() {
      this.pagination.page = 1;
      this.obtenerUsuarios();
    },
    busqueda() {
      this.pagination.page = 1;
      this.obtenerUsuarios();
    },
    fechaInicio() {
      this.pagination.page = 1;
      this.obtenerUsuarios();
    },
    fechaFin() {
      this.pagination.page = 1;
      this.obtenerUsuarios();
    }
  }
}
</script>
<style scoped>
.shadow-2 {
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
}
.rounded-borders {
  border-radius: 8px;
}
.my-table .q-table__middle {
  background: #f5f7fa;
}
.my-table .q-table__top, .my-table .q-table__bottom {
  background: transparent;
}
.my-table .q-table__th {
  background: #e0e3ea;
  font-weight: bold;
}
.my-table .q-table__tr--body:nth-child(even) {
  background: #f0f4fa;
}
.my-table .q-table__tr--body:nth-child(odd) {
  background: #e9f0ff;
}
.text-positive {
  color: #388e3c;
  font-weight: bold;
}
.text-warning {
  color: #fbc02d;
  font-weight: bold;
}
.text-negative {
  color: #d32f2f;
  font-weight: bold;
}
</style>
