
import { createRouter, createWebHistory } from 'vue-router'

import InicioView from '../views/InicioView.vue'
import RegistrosView from '../views/RegistrosView.vue'
import ResultadosView from '../views/ResultadosView.vue'

const routes = [
  {
    path: '/',
    name: 'inicio',
    component: InicioView
  },
  {
    path: '/registros',
    name: 'registros',
    component: RegistrosView
  },
  {
    path: '/resultados',
    name: 'resultados',
    component: ResultadosView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
