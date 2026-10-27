<template>
  <!-- 注意：这里不再套 <div id="app">，因为 index.html 里已经有一个了，
       套两层会让 flex 布局错乱。Vue 3 允许一个组件有多个根节点 -->
  <van-nav-bar :title="title" :border="false" class="app-nav" />

  <div class="page-body">
    <router-view />
  </div>

  <van-tabbar route :fixed="false" :border="false" active-color="#4f63ff" inactive-color="#8a90a2">
    <van-tabbar-item to="/" icon="edit">背单词</van-tabbar-item>
    <van-tabbar-item to="/notes" icon="notes-o">我的笔记</van-tabbar-item>
  </van-tabbar>
</template>

<script>
export default {
  name: 'App',
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
