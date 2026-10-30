
<script setup>
import { computed, inject, reactive, ref } from 'vue'

const formularioInicial = () => ({
  material: '',
  cantidad: '',
  fecha: '',
  observaciones: ''
})

const formulario = reactive(formularioInicial())
const registros = inject('registros', ref([]))
const busqueda = ref('')
const filtroMaterial = ref('')
const mensaje = ref('')
const tipoMensaje = ref('')
const idEditando = ref(null)

// Tipo de usuario compartido desde App.vue.
const tipoUsuario = inject('tipoUsuario', ref('administrador'))
const esAdministrador = computed(() => tipoUsuario.value === 'administrador')

const hoy = new Date().toLocaleDateString('en-CA')
const modoEdicion = computed(() => idEditando.value !== null)

const registrosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return registros.value.filter((registro) => {
    const coincideMaterial =
      !filtroMaterial.value ||
      registro.material === filtroMaterial.value

    const coincideBusqueda =
      !texto ||
      registro.material.toLowerCase().includes(texto) ||
      registro.observaciones.toLowerCase().includes(texto) ||
      registro.fecha.includes(texto)

    return coincideMaterial && coincideBusqueda
  })
})

function mostrarMensaje(texto, tipo) {
  mensaje.value = texto
  tipoMensaje.value = tipo
}

function validarFormulario() {
  if (!formulario.material) {
    mostrarMensaje('Seleccioná un material.', 'error')
    return false
  }

  const cantidad = Number(formulario.cantidad)

  if (
    formulario.cantidad === '' ||
    !Number.isFinite(cantidad) ||
    cantidad <= 0
  ) {
    mostrarMensaje('Ingresá una cantidad mayor que cero.', 'error')
    return false
  }

  if (!formulario.fecha) {
    mostrarMensaje('Seleccioná la fecha de recolección.', 'error')
    return false
  }

  const fechaSeleccionada = new Date(`${formulario.fecha}T00:00:00`)
  const fechaActual = new Date()
  fechaActual.setHours(0, 0, 0, 0)

  if (
    Number.isNaN(fechaSeleccionada.getTime()) ||
    fechaSeleccionada > fechaActual
  ) {
    mostrarMensaje('La fecha no puede ser futura.', 'error')
    return false
  }

  return true
}

function registrarResiduo() {
  if (!esAdministrador.value) return
  mensaje.value = ''
  tipoMensaje.value = ''

  if (!validarFormulario()) return

  const datos = {
    material: formulario.material,
    cantidad: Number(formulario.cantidad),
    fecha: formulario.fecha,
    observaciones: formulario.observaciones.trim()
  }

  if (modoEdicion.value) {
    const indice = registros.value.findIndex(
      (registro) => registro.id === idEditando.value
    )

    if (indice === -1) {
      cancelarEdicion()
      mostrarMensaje('No se encontró el registro que querías editar.', 'error')
      return
    }

    registros.value[indice] = {
      ...registros.value[indice],
      ...datos
    }

    cancelarEdicion()
    mostrarMensaje('Registro actualizado correctamente en la memoria temporal.', 'exito')
    return
  }

  registros.value.unshift({
    id: Date.now(),
    ...datos,
    esPrueba: false
  })

  limpiarFormulario()
  mostrarMensaje('Registro agregado a la lista temporal.', 'exito')
}

function editarRegistro(registro) {
  if (!esAdministrador.value) return
  idEditando.value = registro.id

  formulario.material = registro.material
  formulario.cantidad = String(registro.cantidad)
  formulario.fecha = registro.fecha
  formulario.observaciones = registro.observaciones

  mensaje.value = ''
  tipoMensaje.value = ''

  document.getElementById('formulario-registro')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

function cancelarEdicion() {
  idEditando.value = null
  limpiarFormulario()
}

function limpiarFormulario() {
  Object.assign(formulario, formularioInicial())
}

function eliminarRegistro(id) {
  if (!esAdministrador.value) return
  const registro = registros.value.find((item) => item.id === id)

  if (!registro) return

  registros.value = registros.value.filter((item) => item.id !== id)

  if (idEditando.value === id) {
    cancelarEdicion()
  }

  mostrarMensaje('Registro eliminado de la lista temporal.', 'exito')
}

function cargarDatosPrueba() {
  if (!esAdministrador.value) return
  registros.value = [
    {
      id: 1,
      material: 'Papel',
      cantidad: 5.5,
      fecha: '2026-10-20',
      observaciones: 'Hojas usadas de actividades escolares.',
      esPrueba: true
    },
    {
      id: 2,
      material: 'Cartón',
      cantidad: 8,
      fecha: '2026-10-22',
      observaciones: 'Cajas limpias para reutilizar.',
      esPrueba: true
    },
    {
      id: 3,
      material: 'Plástico',
      cantidad: 3.2,
      fecha: '2026-10-24',
      observaciones: 'Envases limpios.',
      esPrueba: true
    }
  ]

  cancelarEdicion()
  mostrarMensaje('Se cargaron registros ficticios para realizar pruebas.', 'exito')
}

const totalKg = computed(() =>
  registrosFiltrados.value.reduce(
    (total, registro) => total + registro.cantidad,
    0
  )
)
</script>

<template>
  <section>
    <div class="page-topline">
      <span class="breadcrumb">EcoEscuela / Registros</span>
      <span class="project-label">Gestión de residuos</span>
    </div>

    <div class="section-heading">
      <div>
        <h1>Registros de residuos</h1>
        <p>Registrá, buscá y administrá los materiales recolectados.</p>
      </div>
    </div>

    <div v-if="!esAdministrador" class="data-notice">
      <span class="info-icon">ⓘ</span>
      <span>Estás en modo Consulta. Podés ver, buscar y filtrar registros, pero no modificarlos.</span>
    </div>

    <form
      v-if="esAdministrador"
      id="formulario-registro"
      class="feature-card form-card"
      @submit.prevent="registrarResiduo"
    >
      <div class="form-title">
        <div>
          <h2>{{ modoEdicion ? 'Editar registro' : 'Nuevo registro' }}</h2>
          <p class="card-description">
            Los campos marcados con * son obligatorios.
          </p>
        </div>

        <span v-if="modoEdicion" class="record-tag">Modo edición</span>
      </div>

      <div class="form-grid">
        <div class="form-field">
          <label for="material">Material *</label>
          <select id="material" v-model="formulario.material" required>
            <option value="" disabled>Seleccioná un material</option>
            <option value="Papel">Papel</option>
            <option value="Cartón">Cartón</option>
            <option value="Plástico">Plástico</option>
          </select>
        </div>

        <div class="form-field">
          <label for="cantidad">Cantidad (kg) *</label>
          <input
            id="cantidad"
            v-model="formulario.cantidad"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Ej.: 2.5"
            required
          />
        </div>

        <div class="form-field">
          <label for="fecha">Fecha de recolección *</label>
          <input
            id="fecha"
            v-model="formulario.fecha"
            type="date"
            :max="hoy"
            required
          />
        </div>

        <div class="form-field">
          <label for="observaciones">Observaciones</label>
          <textarea
            id="observaciones"
            v-model="formulario.observaciones"
            maxlength="250"
            rows="3"
            placeholder="Información adicional (opcional)"
          ></textarea>
        </div>
      </div>

      <p
        v-if="mensaje"
        class="form-message"
        :class="tipoMensaje"
        role="status"
      >
        {{ mensaje }}
      </p>

      <div class="form-actions">
        <button class="primary-button" type="submit">
          {{ modoEdicion ? 'Guardar cambios' : 'Agregar registro' }} →
        </button>

        <button
          v-if="modoEdicion"
          class="secondary-button"
          type="button"
          @click="cancelarEdicion"
        >
          Cancelar
        </button>
      </div>
    </form>

    <section class="records-section">
      <div class="section-heading">
        <div>
          <h2>Listado de registros</h2>
          <p>
            {{ registrosFiltrados.length }} registro(s) ·
            {{ totalKg.toLocaleString('es-AR', { maximumFractionDigits: 2 }) }} kg
            en el resultado actual.
          </p>
        </div>

        <button
          v-if="esAdministrador"
          class="secondary-button"
          type="button"
          @click="cargarDatosPrueba"
        >
          Cargar datos de prueba
        </button>
      </div>

      <div class="data-notice">
        <span class="info-icon">ⓘ</span>
        <span>
          Los registros se almacenan temporalmente en memoria.
          Los ejemplos son ficticios y están identificados como datos de prueba.
          Los cambios se perderán al recargar la página.
        </span>
      </div>

      <div class="filters">
        <div class="form-field">
          <label for="busqueda">Buscar</label>
          <input
            id="busqueda"
            v-model="busqueda"
            type="search"
            placeholder="Material, fecha u observaciones..."
          />
        </div>

        <div class="form-field">
          <label for="filtroMaterial">Filtrar por material</label>
          <select id="filtroMaterial" v-model="filtroMaterial">
            <option value="">Todos los materiales</option>
            <option value="Papel">Papel</option>
            <option value="Cartón">Cartón</option>
            <option value="Plástico">Plástico</option>
          </select>
        </div>
      </div>

      <div v-if="registrosFiltrados.length" class="table-wrapper">
        <table class="records-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Cantidad</th>
              <th>Fecha</th>
              <th>Observaciones</th>
              <th>Tipo</th>
              <th v-if="esAdministrador">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="registro in registrosFiltrados" :key="registro.id">
              <td>{{ registro.material }}</td>
              <td>{{ registro.cantidad.toLocaleString('es-AR') }} kg</td>
              <td>{{ registro.fecha }}</td>
              <td>{{ registro.observaciones || '—' }}</td>
              <td>
                <span
                  class="record-tag"
                  :class="{ test: registro.esPrueba }"
                >
                  {{ registro.esPrueba ? 'Dato de prueba' : 'Temporal' }}
                </span>
              </td>
              <td v-if="esAdministrador">
                <div class="row-actions">
                  <button
                    class="edit-button"
                    type="button"
                    @click="editarRegistro(registro)"
                  >
                    Editar
                  </button>

                  <button
                    class="delete-button"
                    type="button"
                    @click="eliminarRegistro(registro.id)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <span class="empty-icon">▤</span>
        <h3>No hay registros para mostrar</h3>
        <p>Agregá un registro o cargá los datos de prueba.</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.form-card h2 {
  margin-bottom: 7px;
  font-size: 18px;
}

.form-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-description {
  margin-bottom: 24px;
  color: var(--muted);
  font-size: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  min-height: 43px;
  padding: 11px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  outline: none;
  background: #fff;
  color: var(--text);
  font-size: 12px;
}

.form-field textarea {
  resize: vertical;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgb(49 128 82 / 10%);
}

.form-actions,
.row-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 24px;
}

.secondary-button,
.edit-button,
.delete-button {
  min-height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  color: var(--green-dark);
  font-size: 11px;
  font-weight: 700;
}

.secondary-button:hover,
.edit-button:hover {
  background: var(--green-soft);
}

.form-message {
  margin: 22px 0 0;
  padding: 12px 14px;
  border-radius: 9px;
  font-size: 12px;
  line-height: 1.6;
}

.form-message.error {
  background: #fff0ee;
  color: #a33b30;
}

.form-message.exito {
  background: var(--green-soft);
  color: var(--green-dark);
}

.records-section {
  margin-top: 34px;
}

.records-section .section-heading {
  align-items: center;
  flex-wrap: wrap;
}

.records-section .section-heading h2 {
  margin-bottom: 6px;
}

.filters {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(190px, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: #fff;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;
}

.records-table th,
.records-table td {
  padding: 15px 14px;
  border-bottom: 1px solid var(--border);
}

.records-table th {
  background: #f7f9f7;
  color: #68756b;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.records-table tbody tr:last-child td {
  border-bottom: 0;
}

.record-tag {
  display: inline-block;
  padding: 5px 8px;
  border-radius: 20px;
  background: #edf3ef;
  color: #52665a;
  font-size: 10px;
  white-space: nowrap;
}

.record-tag.test {
  background: #fff3dc;
  color: #8a641e;
}

.row-actions {
  justify-content: flex-start;
  margin-top: 0;
}

.delete-button {
  border-color: #f0d6d2;
  color: #a33b30;
}

.delete-button:hover {
  background: #fff0ee;
}

.empty-state {
  padding: 35px 20px;
  border: 1px dashed var(--border);
  border-radius: 13px;
  background: #fff;
  text-align: center;
}

.empty-icon {
  display: block;
  margin-bottom: 12px;
  color: var(--green);
  font-size: 28px;
}

.empty-state h3 {
  margin-bottom: 8px;
  font-size: 15px;
}

.empty-state p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 650px) {
  .form-grid,
  .filters {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button,
  .records-section .secondary-button {
    width: 100%;
  }

  .records-section .section-heading {
    align-items: stretch;
  }
}
</style>
