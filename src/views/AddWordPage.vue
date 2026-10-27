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
    // 参数 payload 就是子组件 emit 出来的那个对象。
    // 加了 async：因为下面要 await 网络请求
    async onAdd(payload) {
      const word = payload.word

      // 本地去重：先在自己手上过一遍，不用等网络。
      // 注意这只是「体验上少一次往返」，真正防重复的还是数据库的 uk_word 唯一键
      const key = word.toLowerCase()
      const inWords = store.words.some((w) => w.word.toLowerCase() === key)
      const inMastered = store.mastered.some((m) => m.word.toLowerCase() === key)

      if (inWords || inMastered) {
        const msg = inMastered ? '这个单词已经在「已掌握」里了' : '这个单词已经在词库里了'
        showToast(msg)
        return
      }

      // fetch 只传一个地址时默认是 GET。要往回送数据就必须写第二个参数：
      //   method  —— 用什么方法
      //   headers —— 送的是什么格式（少了 Content-Type，后端不知道该怎么解析，回 415）
      //   body    —— 真正的内容，只能是字符串，所以对象要 JSON.stringify 成文本
      try {
        const res = await fetch('/api/words', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // 注意不能写成 { word, meaning, example } —— 那是 ES6 简写，
          // 要求作用域里真有叫 meaning / example 的变量，这里只有 payload.xxx
          body: JSON.stringify({
            word: payload.word,
            meaning: payload.meaning,
            example: payload.example
          })
        })

        console.log('[add] 后端返回状态：', res.status)

        if (!res.ok) {
          // 状态码是后端给程序看的「结论摘要」，不用去解析文字也能分辨发生了什么
          if (res.status === 409) {
            showToast('这个单词已经在词库里了')
          } else {
            showToast('保存失败，后端返回 ' + res.status)
          }
          return
        }

        // 后端把刚存进去的那条原样返回了，而且带着数据库分配的 id
        const saved = await res.json()
        console.log('[add] 已存入数据库：', saved)

        // 只有后端确认存成功了，才往页面上加。顺序反过来的话，
        // 一旦请求失败，页面上有、数据库里没有，刷新就消失 —— 那种 bug 最难查
        store.words.push({
          word: saved.word,
          meaning: saved.meaning,
          example: saved.example,
          result: '',
          expanded: false
        })

        showToast('已加入词库')
      } catch (e) {
        // fetch 只有在「请求根本没发出去」时才抛错（断网、代理没起、变量写错）。
        // 不接住的话错误会变成一条没人看的 unhandled rejection，页面上什么都不发生
        console.error('[add] 请求失败：', e)
        showToast('添加失败：' + e.message)
      }
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
