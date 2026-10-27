import { createRouter, createWebHistory } from 'vue-router'
import WordPage from '../views/WordPage.vue'
import NotesPage from '../views/NotesPage.vue'

const routes = [
  { path: '/', component: WordPage, meta: { title: '背单词' } },
  { path: '/notes', component: NotesPage, meta: { title: '笔记本' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
