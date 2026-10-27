<template>
  <div id="app">
    <h1>背单词系统</h1>

    <nav>
      <router-link to="/">背单词</router-link>
      <router-link to="/notes">我的笔记</router-link>
    </nav>

    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
