<template>
  <div class="notes-page">
    <van-search
      v-model="keyword"
      placeholder="搜索单词或中文"
      shape="round"
      background="transparent"
    />

    <div class="toolbar">
      <span class="count">共 {{ filteredNotes.length }} 条</span>

      <van-button
        size="mini"
        round
        :type="sortOrder === 'az' ? 'primary' : 'default'"
        :plain="sortOrder !== 'az'"
        @click="setSort('az')"
      >
        A → Z
      </van-button>
      <van-button
        size="mini"
        round
        :type="sortOrder === 'za' ? 'primary' : 'default'"
        :plain="sortOrder !== 'za'"
        @click="setSort('za')"
      >
        Z → A
      </van-button>
    </div>

    <!-- 一条都没有 / 搜不到 -->
    <van-empty
      v-if="filteredNotes.length === 0"
      :description="store.notes.length === 0 ? '还没有笔记，去背单词页点「加入笔记」' : '没搜到这个单词'"
    />

    <div v-else class="note-list">
      <div v-for="note in filteredNotes" :key="note.word" class="note">
        <div class="note-head">
          <span class="note-word">{{ note.word }}</span>
          <van-icon name="delete-o" class="note-del" @click="confirmRemove(note)" />
        </div>

        <div class="note-meaning">{{ note.meaning }}</div>

        <div v-if="note.expanded" class="note-example">{{ note.example }}</div>

        <van-button
          class="note-toggle"
          size="mini"
          round
          plain
          type="primary"
          @click="toggleExpand(note)"
        >
          {{ note.expanded ? '收起' : '扩展讲解' }}
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
import { showConfirmDialog } from 'vant'
import { store } from '../store.js'

export default {
  name: 'NotesPage',

  data() {
    return {
      store,
      keyword: '',
      sortOrder: 'az'
    }
  },

  computed: {
    filteredNotes() {
      const k = this.keyword.toLowerCase()

      // 先筛：英文或中文命中都留下
      const list = store.notes.filter(
        (n) => n.word.toLowerCase().includes(k) || n.meaning.includes(k)
      )

      // 再排：在 filter 产出的副本上排，不动 store.notes 的原始顺序
      if (this.sortOrder === 'za') {
        list.sort((a, b) => (a.word > b.word ? -1 : 1))
      } else {
        list.sort((a, b) => (a.word > b.word ? 1 : -1))
      }

      return list
    }
  },

  methods: {
    setSort(v) {
      this.sortOrder = v
    },

    confirmRemove(note) {
      showConfirmDialog({
        title: '删除笔记',
        message: `确定要删除「${note.word}」吗？`
      })
        .then(() => {
          store.notes = store.notes.filter((n) => n.word !== note.word)
        })
        .catch(() => {
          // 用户点了取消，什么都不做
        })
    },

    toggleExpand(note) {
      note.expanded = !note.expanded
    }
  }
}
</script>

<style scoped>
.notes-page {
  display: flex;
  flex-direction: column;
}

/* 搜索框贴边一点，透出页面底色 */
.notes-page :deep(.van-search) {
  padding: 4px 0 8px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 2px 14px;
}
.count {
  font-size: 12px;
  color: var(--ink-2);
  margin-right: auto;
}

.note-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note {
  background: #fff;
  border-radius: 18px;
  box-shadow: var(--card-shadow);
  padding: 16px 16px 14px;
}

.note-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.note-word {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.note-del {
  font-size: 19px;
  color: #a8aebd;
  padding: 2px;
  transition: color 0.2s;
}
.note-del:active {
  color: var(--van-danger-color);
}

.note-meaning {
  font-size: 14px;
  color: var(--ink-2);
  margin-top: 4px;
  line-height: 1.5;
}

.note-example {
  margin-top: 12px;
  padding: 11px 13px;
  background: var(--brand-soft);
  border-radius: 12px;
  font-size: 12.5px;
  line-height: 1.75;
  color: #445;
}

.note-toggle {
  margin-top: 12px;
}
</style>
