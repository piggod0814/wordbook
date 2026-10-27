import { createRouter, createWebHistory } from 'vue-router'
import WordPage from '../views/WordPage.vue'
import NotesPage from '../views/NotesPage.vue'
import AddWordPage from '../views/AddWordPage.vue'

const routes = [
  { path: '/', component: WordPage, meta: { title: '背单词' } },
  { path: '/notes', component: NotesPage, meta: { title: '笔记本' } },
  { path: '/add', component: AddWordPage, meta: { title: '添加单词' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
