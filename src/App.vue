
<script setup>
import { provide, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Tipo de usuario seleccionado para realizar las pruebas.
const tipoUsuario = ref('administrador')

// Lista de registros compartida entre las pantallas.
const registros = ref([])

// Compartimos los datos con las demás pantallas.
provide('tipoUsuario', tipoUsuario)
provide('registros', registros)

const navigation = [
  { label: 'Inicio', symbol: '⌂', path: '/' },
  { label: 'Registros', symbol: '▤', path: '/registros' },
  { label: 'Resultados', symbol: '▥', path: '/resultados' }
]
</script>

<template>
  <div class="app">
    <header class="site-header">
      <div class="nav-container">
        <RouterLink class="brand" to="/" aria-label="EcoEscuela, inicio">
          <span class="brand-icon">♻</span>
          <span>
            <span class="brand-name">EcoEscuela</span>
            <span class="brand-caption">Cooperativa escolar</span>
          </span>
        </RouterLink>

        <nav class="nav-links" aria-label="Navegación principal">
          <RouterLink
            v-for="item in navigation"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ active: route.path === item.path }"
          >
            <span class="nav-icon">{{ item.symbol }}</span>
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div class="user-selector">
          <label for="tipo-usuario">Tipo de usuario</label>
          <select id="tipo-usuario" v-model="tipoUsuario">
            <option value="administrador">Administrador</option>
            <option value="consulta">Consulta</option>
          </select>
        </div>
      </div>
    </header>

    <main class="page-container">
      <RouterView />

      <footer class="site-footer">
        <span>EcoEscuela · Cooperativa escolar</span>
        <span>Proyecto educativo de reciclaje</span>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.nav-container {
  flex-wrap: wrap;
}

.user-selector {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-left: auto;
}

.user-selector label {
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.user-selector select {
  min-height: 38px;
  padding: 0 30px 0 11px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: #fff;
  color: var(--green-dark);
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 800px) {
  .nav-container {
    gap: 14px;
  }

  .user-selector {
    margin-left: 0;
  }
}

@media (max-width: 520px) {
  .user-selector {
    width: 100%;
  }

  .user-selector label {
    flex-shrink: 0;
  }

  .user-selector select {
    flex: 1;
  }
}
</style>
