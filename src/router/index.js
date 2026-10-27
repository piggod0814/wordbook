import { createRouter, createWebHistory } from 'vue-router'
import WordPage from '../views/WordPage.vue'
import NotesPage from '../views/NotesPage.vue'

const routes = [
  { path: '/', component: WordPage },
  { path: '/notes', component: NotesPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
