<template>
  <div v-if="current" class="word-page">
    <!-- 进度 -->
    <div class="progress">
      <div class="progress-row">
        <span>第 <b>{{ index + 1 }}</b> / {{ words.length }} 个</span>
        <span class="progress-count">{{ answeredCount }} 已答</span>
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

    <!-- 主操作 -->
    <div class="actions">
      <van-button round size="large" class="btn-no" @click="forget">
        <van-icon name="cross" />
        不记得
      </van-button>
      <van-button round size="large" class="btn-ok" @click="remember">
        <van-icon name="success" />
        记得
      </van-button>
    </div>

    <!-- 次操作 -->
    <div class="sub-actions">
      <van-button
        size="small"
        round
        plain
        icon="plus"
        :disabled="noted"
        @click="addNote"
      >
        {{ noted ? '已在笔记' : '加入笔记' }}
      </van-button>

      <van-button
        v-if="current.result === '不记得'"
        size="small"
        round
        plain
        @click="toggleExample"
      >
        {{ current.expanded ? '收起讲解' : '扩展讲解' }}
      </van-button>

      <van-button size="small" round plain type="primary" icon="arrow" icon-position="right" @click="next">
        下一个
      </van-button>
    </div>
  </div>

  <!-- 一轮走完、全部记得 -->
  <van-empty v-else description="全部背完了 🎉">
    <van-button round type="primary" size="small" @click="restart">重新背一遍</van-button>
  </van-empty>
</template>

<script>
import { store, defaultWords } from '../store.js'

export default {
  name: 'WordCard',

  data() {
    return {
      index: 0,
      showMeaning: false
    }
  },

  computed: {
    words() {
      return store.words
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
    if (this.current && this.current.result) {
      this.showMeaning = true
    }
  },

  methods: {
    remember() {
      this.showMeaning = true
      this.current.result = '记得'
    },

    forget() {
      this.showMeaning = true
      this.current.result = '不记得'
    },

    next() {
      this.showMeaning = false
      if (this.index < this.words.length - 1) {
        this.index++
      } else {
        // 一轮走完：只留下"不记得"的进第二轮
        store.words = store.words.filter((w) => w.result === '不记得')
        this.index = 0
      }
    },

    addNote() {
      const current = this.current
      const exists = store.notes.some((n) => n.word === current.word)
      if (!exists) {
        store.notes.push({
          word: current.word,
          meaning: current.meaning,
          example: current.example,
          expanded: false
        })
      }
    },

    toggleExample() {
      this.current.expanded = !this.current.expanded
    },

    // 词表被筛空之后，用它回到最初那份词
    restart() {
      store.words = JSON.parse(JSON.stringify(defaultWords))
      this.index = 0
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
  border-radius: 99px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, #7b8cff, #4f63ff);
  transition: width 0.3s ease;
}

/* ---- 卡片 ---- */
.card {
  position: relative;
  flex: 1;
  min-height: 270px;
  background: #fff;
  border-radius: 24px;
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
  box-shadow: 0 0 0 2px #d6f5e0, var(--card-shadow);
}
.card--no {
  box-shadow: 0 0 0 2px #ffe3b3, var(--card-shadow);
}

.tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 99px;
  background: #f1f3f9;
  color: var(--ink-2);
  font-weight: 600;
  margin-bottom: 18px;
}
.tag--ok {
  background: var(--ok-soft);
  color: #16a34a;
}
.tag--no {
  background: var(--warn-soft);
  color: #d97706;
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
  border-radius: 14px;
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
  gap: 12px;
}
.actions > * {
  flex: 1;
}

.btn-ok,
.btn-no {
  height: 52px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  border: none;
}
.btn-ok {
  background: var(--ok);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.28);
}
.btn-no {
  background: var(--warn);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.28);
}
.btn-ok:active,
.btn-no:active {
  transform: translateY(1px);
}

.sub-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 2px;
}
</style>
