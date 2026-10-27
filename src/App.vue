<template>
  <!-- 注意：这里不再套 <div id="app">，因为 index.html 里已经有一个了，
       套两层会让 flex 布局错乱。Vue 3 允许一个组件有多个根节点 -->
  <van-nav-bar :title="title" :border="false" class="app-nav" />

  <div class="page-body">
    <router-view />
  </div>

  <van-tabbar route :fixed="false" :border="false" active-color="#4f63ff" inactive-color="#8a90a2">
    <van-tabbar-item to="/" icon="edit">背单词</van-tabbar-item>
    <van-tabbar-item to="/add" icon="plus">添加</van-tabbar-item>
    <van-tabbar-item to="/notes" icon="notes-o">笔记本</van-tabbar-item>
  </van-tabbar>
</template>

<script>
import { loadWords, loadNotes } from './store'

export default {
  name: 'App',
  // mounted = 组件挂到页面上之后执行一次。放这里是因为它是全应用最外层的组件，
  // 进来就跑一次，不管用户先打开哪个页签，数据都已经在了
  async mounted() {
    try {
      // 两个请求互不依赖（笔记不靠单词算出来，反之亦然），
      // 所以用 Promise.all 一起发出去、一起等，而不是 await 一个再 await 一个。
      // 串行的话总耗时是两段时间相加，并行只等于较慢的那一个。
      await Promise.all([loadWords(), loadNotes()])
    } catch (e) {
      console.error('从后端加载数据失败：', e)
    }
  },
  computed: {
    // 标题跟着路由表里的 meta.title 走
    title() {
      return this.$route.meta.title || '背单词'
    }
  }
}
</script>

<style scoped>
.app-nav {
  --van-nav-bar-background: #ffffff;
  --van-nav-bar-title-text-color: #1f2430;
  box-shadow: 0 1px 0 var(--line);
}

.app-nav :deep(.van-nav-bar__title) {
  font-weight: 700;
  letter-spacing: 0.02em;
}
</style>
