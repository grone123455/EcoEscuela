

<script setup>
import { computed, inject } from 'vue'

// Obtenemos los registros compartidos desde App.vue.
const registros = inject('registros')

// Materiales que utiliza el formulario.
const materiales = ['Papel', 'Cartón', 'Plástico']

// Calculamos las cantidades de cada material.
const resultados = computed(() =>
  materiales.map(material => {
    const registrosMaterial = registros.value.filter(
      registro => registro.material === material
    )

    const recolectado = registrosMaterial.reduce(
      (total, registro) => total + Number(registro.cantidad || 0),
      0
    )

    const correctamenteSeparado = registrosMaterial.reduce(
      (total, registro) =>
        total + Number(registro.cantidadCorrectamenteSeparada ?? 0),
      0
    )

    return {
      material,
      recolectado,
      correctamenteSeparado
    }
  })
)

// Totales generales.
const totalRecolectado = computed(() =>
  resultados.value.reduce((total, item) => total + item.recolectado, 0)
)

const totalCorrectamenteSeparado = computed(() =>
  resultados.value.reduce(
    (total, item) => total + item.correctamenteSeparado,
    0
  )
)

// Indicador de correcta separación de residuos.
const porcentajeCorrectamenteSeparado = computed(() => {
  if (totalRecolectado.value === 0) return null

  return Math.round(
    (totalCorrectamenteSeparado.value / totalRecolectado.value) * 100
  )
})

// Meta de correcta separación para el tercer mes.
const metaSeparacion = 85

const metaAlcanzada = computed(() =>
  porcentajeCorrectamenteSeparado.value !== null &&
  porcentajeCorrectamenteSeparado.value >= metaSeparacion
)

// Indicador de disponibilidad de materiales.
// Valores ficticios para realizar pruebas.
const materialesDisponibles = 9
const materialesNecesarios = 10
const metaDisponibilidad = 90

const porcentajeDisponibilidad = computed(() => {
  if (materialesNecesarios === 0) return null

  return Math.round(
    (materialesDisponibles / materialesNecesarios) * 100
  )
})

const disponibilidadAlcanzada = computed(() =>
  porcentajeDisponibilidad.value !== null &&
  porcentajeDisponibilidad.value >= metaDisponibilidad
)

// Formato de kilogramos.
function formatoKg(cantidad) {
  return Number(cantidad || 0).toLocaleString('es-AR', {
    maximumFractionDigits: 2
  })
}
</script>


<template>
  <section class="results-page">
    <div class="page-topline">
      <span class="breadcrumb">EcoEscuela / Resultados</span>
      <span class="project-label">Impacto ambiental</span>
    </div>

    <div class="section-heading">
      <div>
        <h1>Resultados del proyecto</h1>
        <p>Consultá las cantidades recolectadas y correctamente separadas.</p>
      </div>
    </div>

    <div class="data-notice">
      <span class="info-icon">ⓘ</span>
      <span>
        Los resultados se calculan automáticamente a partir de los registros
        cargados. Los datos de prueba no representan resultados reales.
      </span>
    </div>

    <div class="results-grid">
<article class="feature-card result-card">
  <div class="feature-icon">%</div>

  <p class="result-label">Correcta separación</p>

  <p class="result-number">
    {{ porcentajeCorrectamenteSeparado === null
      ? '—'
      : porcentajeCorrectamenteSeparado
    }}<span v-if="porcentajeCorrectamenteSeparado !== null">%</span>
  </p>

  <p class="result-description">
    Porcentaje sobre el total de residuos recolectados.
  </p>

  <div class="goal-section">
    <div class="goal-info">
      <span>Meta del tercer mes</span>
      <strong>{{ metaSeparacion }}%</strong>
    </div>

    <div class="goal-progress">
      <div
        class="goal-progress-fill"
        :style="{
          width: `${Math.min(porcentajeCorrectamenteSeparado ?? 0, 100)}%`
        }"
      ></div>
    </div>

    <span
      v-if="porcentajeCorrectamenteSeparado === null"
      class="goal-status unavailable"
    >
      No calculable: no hay datos suficientes
    </span>

    <span
      v-else-if="metaAlcanzada"
      class="goal-status achieved"
    >
      ✓ Meta alcanzada
    </span>

    <span
      v-else
      class="goal-status pending"
    >
      Meta no alcanzada
    </span>
  </div>
</article>

      <article class="feature-card result-card">
        <div class="feature-icon">✓</div>
        <p class="result-label">Correctamente separados</p>
        <p class="result-number">
          {{ formatoKg(totalCorrectamenteSeparado) }} <span>kg</span>
        </p>
        <p class="result-description">
          Cantidad de residuos separados correctamente.
        </p>
      </article>

      <article class="feature-card result-card">
        <div class="feature-icon">%</div>
        <p class="result-label">Correcta separación</p>
        <p class="result-number">
          {{ porcentajeCorrectamenteSeparado === null
            ? '—'
            : porcentajeCorrectamenteSeparado
          }}<span v-if="porcentajeCorrectamenteSeparado !== null">%</span>
        </p>
        <p class="result-description">
          Porcentaje sobre el total de residuos recolectados.
        </p>
      </article>
    </div>

    <div class="feature-card materials-card">
      <div class="materials-heading">
        <div>
          <h2>Detalle por material</h2>
          <p>Comparación de cantidades en kilogramos.</p>
        </div>
        <span class="record-tag test">Datos de prueba</span>
      </div>

      <div
        class="table-wrapper"
        role="region"
        aria-label="Detalle de resultados por material"
        tabindex="0"
      >
        <table class="results-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Recolectado</th>
              <th>Correctamente separado</th>
              <th>Pendiente de separación</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in resultados" :key="item.material">
              <td>{{ item.material }}</td>
              <td>{{ formatoKg(item.recolectado) }} kg</td>
              <td>{{ formatoKg(item.correctamenteSeparado) }} kg</td>
              <td>
                {{ formatoKg(item.recolectado - item.correctamenteSeparado) }} kg
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <th>Total</th>
              <th>{{ formatoKg(totalRecolectado) }} kg</th>
              <th>{{ formatoKg(totalCorrectamenteSeparado) }} kg</th>
              <th>
                {{ formatoKg(totalRecolectado - totalCorrectamenteSeparado) }} kg
              </th>
            </tr>
          </tfoot>
        </table>
      </div>

      <p class="table-hint">
        Deslizá la tabla horizontalmente para consultar todas las columnas.
      </p>
    </div>
  </section>
</template>

<style scoped>
.results-page {
  width: 100%;
  min-width: 0;
}

.data-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 22px;
  padding: 14px 16px;
  border: 1px solid #eadcb8;
  border-radius: 10px;
  background: #fff9e9;
  color: #765d25;
  font-size: 12px;
  line-height: 1.6;
}

.data-notice > span:last-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.info-icon {
  flex-shrink: 0;
  font-size: 16px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 28px;
  min-width: 0;
}

.result-card {
  min-width: 0;
  width: 100%;
}

.result-label {
  margin: 18px 0 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}

.result-number {
  margin: 0;
  color: var(--green-dark);
  font-size: clamp(25px, 3vw, 34px);
  font-weight: 800;
  letter-spacing: -1px;
  overflow-wrap: anywhere;
}

.result-number span {
  margin-left: 5px;
  font-size: 15px;
  font-weight: 600;
}

.result-description {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}

.materials-card {
  width: 100%;
  min-width: 0;
  margin-bottom: 25px;
}

.materials-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.materials-heading > div {
  min-width: 0;
}

.materials-heading h2 {
  margin: 0 0 7px;
  font-size: 18px;
}

.materials-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
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

.table-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.results-table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;
}

.results-table th,
.results-table td {
  padding: 15px 14px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.results-table thead th {
  background: #f7f9f7;
  color: #68756b;
  font-size: 11px;
}

.results-table tfoot th {
  background: #f1f6f2;
  color: var(--green-dark);
}

.results-table tbody tr:last-child td,
.results-table tfoot tr:last-child th {
  border-bottom: 0;
}

.table-hint {
  display: none;
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;
}

@media (max-width: 800px) {
  .results-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .data-notice {
    padding: 12px;
    gap: 8px;
  }

  .results-grid {
    gap: 12px;
    margin-bottom: 20px;
  }

  .result-card,
  .materials-card {
    padding: 18px 14px;
  }

  .result-label {
    margin-top: 14px;
  }

  .result-number {
    font-size: clamp(27px, 8vw, 34px);
  }

  .materials-heading {
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .materials-heading h2 {
    font-size: 16px;
  }

  .table-hint {
    display: block;
  }
}

@media (max-width: 380px) {
  .materials-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-description {
    font-size: 11px;
  }
}

.goal-section {
  margin-top: 18px;
}

.goal-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 9px;
  color: var(--muted);
  font-size: 11px;
}

.goal-info strong {
  color: var(--green-dark);
  font-size: 12px;
}

.goal-progress {
  width: 100%;
  height: 9px;
  overflow: hidden;
  border-radius: 20px;
  background: #e8eee9;
}

.goal-progress-fill {
  height: 100%;
  border-radius: 20px;
  background: #d69a35;
  transition: width 0.3s ease;
}

.goal-status {
  display: inline-block;
  margin-top: 12px;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}

.goal-status.achieved {
  background: #e6f3e9;
  color: #287443;
}

.goal-status.pending {
  background: #fff0df;
  color: #a35e18;
}

.goal-status.unavailable {
  background: #edf0f1;
  color: #647078;
}

</style>
