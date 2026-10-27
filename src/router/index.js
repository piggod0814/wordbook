import { createRouter, createWebHashHistory } from 'vue-router'
import WordPage from '../views/WordPage.vue'
import NotesPage from '../views/NotesPage.vue'
import AddWordPage from '../views/AddWordPage.vue'

const routes = [
  { path: '/', component: WordPage, meta: { title: '背单词' } },
  { path: '/notes', component: NotesPage, meta: { title: '笔记本' } },
  { path: '/add', component: AddWordPage, meta: { title: '添加单词' } }
]

const router = createRouter({
  // 为什么从 createWebHistory 换成 createWebHashHistory？
  //
  // history 模式的 URL 是 http://站点/add，看着干净，但它有个前提：
  // 服务器必须对「任何路径」都返回 index.html，因为 /add 这个文件根本不存在。
  // 开发时 Vite 帮你做了这件事，所以看不见问题；
  // 但打包扔给 Spring Boot 之后，直接访问 /add 或刷新页面就会 404。
  //
  // hash 模式把路由写在 # 后面：http://站点/#/add
  // 浏览器只把 # 之前的部分发给服务器，Spring 永远只看到 /，所以怎么刷新都不会 404。
  // 代价是地址里多个 #，换来的是「零配置就能部署」。
  history: createWebHashHistory(),
  routes
})

export default router
