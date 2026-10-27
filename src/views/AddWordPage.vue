<template>
  <div class="add-page">
    <p class="hint">新词会加到背单词列表的最后，慢慢背不着急</p>

    <!-- 父组件用 @add 接住子组件 emit 出来的 'add' 事件 -->
    <AddWordForm @add="onAdd" />
  </div>
</template>

<script>
import { showToast } from 'vant'
import { store } from '../store.js'
import AddWordForm from '../components/AddWordForm.vue'

export default {
  name: 'AddWordPage',

  components: { AddWordForm },

  methods: {
    // 参数 payload 就是子组件 emit 出来的那个对象
    onAdd(payload) {
      const word = payload.word

      // 去重：两个抽屉都要查，比较时统一转小写（Abandon 和 abandon 算同一个词）。
      // some 是「只要有一条满足就返回 true」—— 和 filter 的区别是它不要结果，只要个是/否
      const key = word.toLowerCase()
      const inWords = store.words.some((w) => w.word.toLowerCase() === key)
      const inMastered = store.mastered.some((m) => m.word.toLowerCase() === key)

      if (inWords || inMastered) {
        const msg = inMastered ? '这个单词已经在「已掌握」里了' : '这个单词已经在词库里了'
        showToast(msg)
        return
      }

      // 补上 result / expanded 两个字段，让它跟词库里的词长得一模一样。
      // 少写一个字段不会报错，但背单词页读到 undefined 就会出怪事
      store.words.push({
        word: payload.word,
        meaning: payload.meaning,
        example: payload.example,
        result: '',
        expanded: false
      })

      showToast('已加入词库')
    }
  }
}
</script>

<style scoped>
.add-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hint {
  margin: 0 2px 2px;
  font-size: 12.5px;
  color: var(--ink-2);
  line-height: 1.6;
}
</style>
