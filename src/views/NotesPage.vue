<template>
  <div class="notes-page">
    <h1>我的笔记</h1>

    <input v-model="keyword" placeholder="搜索单词或中文" />
<button @click="toggleSort">{{ sortOrder === 'az' ? 'A → Z' : 'Z → A' }}</button>


    <p v-if="filteredNotes.length === 0">没有找到笔记。</p>

    <ul v-else>
      <li v-for="note in filteredNotes" :key="note.word">
        {{ note.word }} —— {{ note.meaning }}
        <button @click="toggleExpand(note)">{{ note.expanded ? '收起' : '扩展' }}</button>
        <button @click="removeNote(note)">删除</button>
        <p v-if="note.expanded">{{ note.example }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
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

    const list = store.notes.filter(n =>
      n.word.toLowerCase().includes(k) || n.meaning.includes(k)
    )

    if (this.sortOrder === 'za') {
      list.sort((a, b) => (a.word > b.word ? -1 : 1))
    } else {
      list.sort((a, b) => (a.word > b.word ? 1 : -1))
    }

    return list
  }
}
,

  methods: {
    removeNote(note) {
      store.notes = store.notes.filter(n => n.word !== note.word)
    },

    toggleExpand(note) {
      note.expanded = !note.expanded
    },
    toggleSort() {
      this.sortOrder = this.sortOrder === 'az' ? 'za' : 'az'
    }
  }
}
</script>
