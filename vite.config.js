import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // 代理：开发服务器（5173）收到以 /api 开头的请求时，不自己处理，
    // 而是转发给 8080 上的 Spring Boot。浏览器全程以为自己在跟 5173 说话，
    // 所以不存在「跨域」这回事 —— 这也是为什么不需要在后端写 @CrossOrigin
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  }
})
