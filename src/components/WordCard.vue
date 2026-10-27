<template>
  <div v-if="current" class="word-page">
    <!-- 进度 -->
    <div class="progress">
      <div class="progress-row">
        <span>第 <b>{{ index + 1 }}</b> / {{ words.length }} 个</span>
        <span class="progress-count">{{ answeredCount }} 已答 · {{ masteredCount }} 已掌握</span>
      </div>
      <div class="bar">
        <div class="bar-fill" :style="{ width: progress + '%' }"></div>
      </div>
    </div>

    <!-- 单词卡 -->
    <div class="card" :class="cardState">
      <span class="tag" :class="tagClass">{{ tagText }}</span>

      <div class="word">{{ current.word }}</div>

      <div v-if="showMeaning" class="meaning">{{ current.meaning }}</div>
      <div v-else class="hint">先想一下它的意思，再点下面的按钮</div>

      <div v-if="current.expanded" class="example">
        <div class="example-title">扩展讲解</div>
        <p>{{ current.example }}</p>
      </div>
    </div>

    <!-- 主操作：实心 = 主，描边 = 次 -->
    <div class="actions">
      <van-button class="btn-no" size="large" @click="forget">
        <van-icon name="cross" />
        不记得
      </van-button>
      <van-button class="btn-ok" size="large" @click="remember">
        <van-icon name="success" />
        记得
      </van-button>
    </div>

    <!-- 次操作：纯文字按钮，不抢主操作的视觉 -->
    <div class="sub-actions">
      <van-button
        class="link-btn"
        size="small"
        :disabled="index === 0"
        @click="prev"
      >
        <van-icon name="arrow-left" />
        上一个
      </van-button>

      <van-button class="link-btn" size="small" :disabled="noted" @click="addNote">
        <van-icon name="plus" />
        {{ noted ? '已在笔记' : '加入笔记' }}
      </van-button>

      <van-button
        v-if="current.result === '不记得'"
        class="link-btn"
        size="small"
        @click="toggleExample"
      >
        {{ current.expanded ? '收起讲解' : '扩展讲解' }}
      </van-button>

      <van-button class="link-btn" size="small" @click="master">
        <van-icon name="passed" />
        已掌握
      </van-button>

      <van-button class="link-btn link-btn--strong" size="small" @click="next">
        下一个
        <van-icon name="arrow" />
      </van-button>
    </div>
  </div>

  <!-- 一轮走完、全部记得 -->
  <van-empty v-else description="全部背完了 🎉">
    <van-button type="primary" size="small" @click="restart">重新背一遍</van-button>
  </van-empty>
</template>

<script>
import { showConfirmDialog, showToast } from 'vant'
import { store, loadWords } from '../store.js'

export default {
  name: 'WordCard',

  data() {
    return {
      showMeaning: false
    }
  },

  computed: {
    words() {
      return store.words
    },

    // 当前背到第几个 —— 存在 store 里，所以切页面、刷新都不会丢
    index() {
      return store.index
    },

    // 当前这张卡；没有卡时是 undefined
    current() {
      return this.words[this.index]
    },

    progress() {
      if (!this.words.length) return 0
      return Math.round(((this.index + 1) / this.words.length) * 100)
    },

    answeredCount() {
      return this.words.filter((w) => w.result !== '').length
    },

    masteredCount() {
      return store.mastered.length
    },

    cardState() {
      if (!this.current) return ''
      if (this.current.result === '记得') return 'card--ok'
      if (this.current.result === '不记得') return 'card--no'
      return ''
    },

    tagText() {
      if (!this.current) return ''
      if (this.current.result === '记得') return '记得'
      if (this.current.result === '不记得') return '不记得'
      return '未作答'
    },

    tagClass() {
      if (!this.current) return ''
      if (this.current.result === '记得') return 'tag--ok'
      if (this.current.result === '不记得') return 'tag--no'
      return ''
    },

    // 这个词是否已经在笔记里（在的话按钮置灰）
    noted() {
      if (!this.current) return false
      return store.notes.some((n) => n.word === this.current.word)
    }
  },

  created() {
    // 从本地存档恢复时，已经答过的词直接显示中文
    this.syncMeaning()
  },

  methods: {
    // 切到某个词时：答过就显示中文，没答过就先藏起来
    syncMeaning() {
      this.showMeaning = Boolean(this.current && this.current.result)
    },

    remember() {
      this.showMeaning = true
      this.current.result = '记得'
    },

    forget() {
      this.showMeaning = true
      this.current.result = '不记得'
    },

    prev() {
      if (this.index > 0) {
        store.index--
        this.syncMeaning()
      }
    },

    next() {
      if (this.index < this.words.length - 1) {
        store.index++
        this.syncMeaning()
      } else {
        // 一轮走完：只留下"没记住"的进第二轮。
        // 注意是「不等于 记得」而不是「等于 不记得」——
        // 这样用「下一个」跳过去、压根没作答的词也会留下，不会被悄悄丢掉
        store.words = store.words.filter((w) => w.result !== '记得')
        store.index = 0
        this.showMeaning = false
      }
    },

    async addNote() {
      const current = this.current
      if (store.notes.some((n) => n.word === current.word)) return

      try {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: current.word,
            meaning: current.meaning,
            example: current.example
          })
        })

        // 409 = 数据库里已经有了。这种情况不算失败：
        // 比如换了浏览器，本地笔记是空的，但库里早有这一条。
        // 那就当作「加成功了」，本地补上即可，别弹一个吓人的错误
        if (!res.ok && res.status !== 409) {
          showToast('加笔记失败：' + res.status)
          return
        }

        store.notes.push({
          word: current.word,
          meaning: current.meaning,
          example: current.example,
          expanded: false
        })
        showToast('已加入笔记')
      } catch (e) {
        console.error('[note] 请求失败：', e)
        showToast('加笔记失败：' + e.message)
      }
    },

    toggleExample() {
      this.current.expanded = !this.current.expanded
    },

    // 「已掌握」现在不在本地搬家了，而是把数据库里这条词的 status 改成 mastered。
    // 页面上的「移出 words、加进 mastered」只是本地同步一下显示，真实数据在库里
    master() {
      const current = this.current

      showConfirmDialog({
        title: '标记为已掌握',
        message: `「${current.word}」会从背单词里移出，放进笔记本的「已掌握」`
      })
        .then(() => {
          // 不 return、也不 await：让失败在 markMastered 内部自己处理，
          // 否则会被下面的 .catch 当成「用户点了取消」吞掉
          this.markMastered(current)
        })
        .catch(() => {
          // 点了取消，什么都不做
        })
    },

    async markMastered(current) {
      try {
        const res = await fetch(
          `/api/words/${encodeURIComponent(current.word)}/mastered`,
          { method: 'PUT' }
        )

        if (!res.ok) {
          showToast('标记失败：' + res.status)
          return
        }

        // 后端改成功了，再动界面
        store.mastered.push({
          word: current.word,
          meaning: current.meaning,
          example: current.example
        })

        store.words = store.words.filter((w) => w.word !== current.word)

        // 搬走一条之后，当前下标可能指到数组外面去了，得重新夹一下
        const last = Math.max(store.words.length - 1, 0)
        store.index = Math.min(this.index, last)
        this.syncMeaning()
      } catch (e) {
        console.error('[master] 请求失败：', e)
        showToast('标记失败：' + e.message)
      }
    },

    // 词表被筛空之后，用它回到词库。
    // 注意这里不能再用本地的 freshWords() —— 词库已经在数据库里了，
    // 那样做等于把 words.js 里那 60 个写死的旧词重新塞回来，把库里真实的数据盖掉
    async restart() {
      await loadWords()

      // 已掌握的还是别塞回来
      store.words = store.words.filter(
        (w) => !store.mastered.some((m) => m.word === w.word)
      )
      store.index = 0
      this.showMeaning = false
    }
  }
}
</script>

<style scoped>
.word-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  /* 撑满一屏：卡片占据剩余空间，操作按钮自然沉到屏幕下方 */
  min-height: 100%;
}

/* ---- 进度 ---- */
.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 13px;
  color: var(--ink-2);
  margin-bottom: 8px;
  padding: 0 4px;
}
.progress-row b {
  color: var(--ink);
  font-size: 16px;
}
.progress-count {
  font-size: 12px;
}
.bar {
  height: 6px;
  background: #e7eaf3;
  border-radius: 2px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 2px;
  background: var(--brand);
  transition: width 0.3s ease;
}

/* ---- 卡片 ---- */
.card {
  position: relative;
  flex: 1;
  min-height: 270px;
  background: #fff;
  border-radius: var(--radius-card);
  box-shadow: var(--card-shadow);
  padding: 30px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.card--ok {
  box-shadow: 0 0 0 1.5px #dbe2ff, var(--card-shadow);
}
.card--no {
  box-shadow: 0 0 0 1.5px #e3e7f0, var(--card-shadow);
}

.tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: var(--radius-btn);
  background: #f1f3f9;
  color: var(--ink-2);
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 18px;
}
.tag--ok {
  background: var(--brand-soft);
  color: var(--brand);
}
.tag--no {
  background: #f1f3f9;
  color: #6b7285;
}

.word {
  font-size: 42px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 14px;
  word-break: break-word;
}

.meaning {
  font-size: 19px;
  font-weight: 600;
  color: var(--brand);
  line-height: 1.5;
}

.hint {
  font-size: 13px;
  color: var(--ink-2);
}

.example {
  margin-top: 18px;
  padding: 14px 16px;
  background: var(--brand-soft);
  border-radius: var(--radius-soft);
  text-align: left;
  font-size: 13px;
  line-height: 1.7;
  color: #445;
}
.example-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--brand);
  margin-bottom: 4px;
}
.example p {
  margin: 0;
}

/* ---- 按钮 ---- */
.actions {
  display: flex;
  gap: 10px;
}
.actions > * {
  flex: 1;
}

.btn-ok,
.btn-no {
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  border-radius: var(--radius-btn);
}

/* 主操作：实心蓝 */
.btn-ok {
  background: var(--brand);
  color: #fff;
  border: 1px solid var(--brand);
  box-shadow: 0 6px 16px rgba(79, 99, 255, 0.2);
}

/* 次操作：白底描边，同尺寸但不抢眼 */
.btn-no {
  background: #fff;
  color: var(--ink);
  border: 1px solid var(--edge);
}

.btn-ok:active,
.btn-no:active {
  transform: translateY(1px);
}

/* 次要操作：纯文字按钮，没有边框和底色 */
.sub-actions {
  display: flex;
  gap: 2px;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 2px;
}

.link-btn {
  height: auto;
  padding: 7px 10px;
  background: transparent;
  border: none;
  border-radius: var(--radius-btn);
  font-size: 13px;
  color: var(--ink-2);
}

.link-btn:active {
  background: rgba(79, 99, 255, 0.06);
}

.link-btn--strong {
  color: var(--brand);
  font-weight: 600;
}
</style>
