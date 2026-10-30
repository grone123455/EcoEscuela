<script setup>
import { computed, inject } from 'vue'

// Obtenemos los registros compartidos desde App.vue.
const registros = inject('registros')

// Materiales que utiliza el formulario.
const materiales = ['Papel', 'Cartón', 'Plástico']

// Calculamos cuánto se recolectó de cada material.
const resultados = computed(() =>
  materiales.map(material => {
    const recolectado = registros.value
      .filter(registro => registro.material === material)
      .reduce((total, registro) => total + Number(registro.cantidad), 0)

    return {
      material,
      recolectado,
      reutilizado: 0
    }
  })
)

// Totales generales.
const totalRecolectado = computed(() =>
  resultados.value.reduce((total, item) => total + item.recolectado, 0)
)

const totalReutilizado = computed(() =>
  resultados.value.reduce((total, item) => total + item.reutilizado, 0)
)

// Porcentaje reutilizado.
const porcentajeReutilizado = computed(() => {
  if (totalRecolectado.value === 0) return 0

  return Math.round(
    (totalReutilizado.value / totalRecolectado.value) * 100
  )
})

function formatoKg(cantidad) {
  return cantidad.toLocaleString('es-AR', {
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
        <p>Consultá las cantidades recolectadas y reutilizadas.</p>
      </div>
    </div>

    <div class="data-notice">
      <span class="info-icon">ⓘ</span>
      <span>
        Estos valores son ficticios y se utilizan únicamente para
        realizar pruebas. No representan resultados reales.
      </span>
    </div>

    <div class="results-grid">
      <article class="feature-card result-card">
        <div class="feature-icon">♻</div>
        <p class="result-label">Total recolectado</p>
        <p class="result-number">
          {{ formatoKg(totalRecolectado) }} <span>kg</span>
        </p>
        <p class="result-description">
          Materiales recuperados por la cooperativa.
        </p>
      </article>

      <article class="feature-card result-card">
        <div class="feature-icon">✓</div>
        <p class="result-label">Total reutilizado</p>
        <p class="result-number">
          {{ formatoKg(totalReutilizado) }} <span>kg</span>
        </p>
        <p class="result-description">
          Materiales destinados a un nuevo uso.
        </p>
      </article>

      <article class="feature-card result-card">
        <div class="feature-icon">%</div>
        <p class="result-label">Porcentaje reutilizado</p>
        <p class="result-number">
          {{ porcentajeReutilizado }}<span>%</span>
        </p>
        <p class="result-description">
          Proporción reutilizada del total recolectado.
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
              <th>Reutilizado</th>
              <th>Pendiente de reutilizar</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in resultados" :key="item.material">
              <td>{{ item.material }}</td>
              <td>{{ formatoKg(item.recolectado) }} kg</td>
              <td>{{ formatoKg(item.reutilizado) }} kg</td>
              <td>{{ formatoKg(item.recolectado - item.reutilizado) }} kg</td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <th>Total</th>
              <th>{{ formatoKg(totalRecolectado) }} kg</th>
              <th>{{ formatoKg(totalReutilizado) }} kg</th>
              <th>
                {{ formatoKg(totalRecolectado - totalReutilizado) }} kg
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
      <p class="table-hint">Deslizá la tabla horizontalmente para consultar todas las columnas.</p>
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
</style>
