import { reactive, watch } from 'vue'
import { wordBank } from './data/words.js'

// 注意：这里是 v2。数据结构变了（词表和以前完全不同），
// 旧存档读进来会跟新词库对不上，所以换个名字，等于让它「读不到旧档」。
const KEY = 'word-app-v2'

// 把词库里的一条「静态资料」变成一条「可以背的词」。
// 词库只提供 word / meaning / example 三样，
// 另外两样是背单词才需要的状态：result（答没答过）、expanded（讲解收没收起）
const toWord = (w) => ({
  word: w.word,
  meaning: w.meaning,
  example: w.example,
  result: '',
  expanded: false
})

// 每次调用都造出一批全新的对象。
// 因为 map 每次都新建对象，所以拿到的天然是副本 ——
// 「重新背一遍」时不会再和上一轮共用同一批词，result 也就不会被带过去。
export const freshWords = () => wordBank.map(toWord)

const saved = localStorage.getItem(KEY)
const archive = saved ? JSON.parse(saved) : null

const initialWords = archive && archive.words ? archive.words : freshWords()

// 存档里的 index 有两种可能出问题：
//   1. 老存档里根本没有这个字段 → undefined
//   2. 词表变短了，存的 index 比数组还大 → 越界
// Math.max / Math.min 这么一夹，就把它按在 [0, words.length - 1] 里
const savedIndex = archive && typeof archive.index === 'number' ? archive.index : 0
const maxIndex = Math.max(initialWords.length - 1, 0)
const initialIndex = Math.min(Math.max(savedIndex, 0), maxIndex)

export const store = reactive({
  words: initialWords,
  notes: archive && archive.notes ? archive.notes : [],
  index: initialIndex
})

watch(store, () => {
  localStorage.setItem(KEY, JSON.stringify(store))
}, { deep: true })
