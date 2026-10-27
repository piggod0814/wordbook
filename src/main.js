import { createApp } from 'vue'
// 注意顺序：先引 Vant 的样式，再引自己的 style.css，
// 这样 style.css 里覆盖的主题色才能压过 Vant 的默认值
import 'vant/lib/index.css'
import './style.css'
import Vant from 'vant'
import App from './App.vue'
import router from './router/index.js'

createApp(App)
  .use(router)
  .use(Vant)
  .mount('#app')
