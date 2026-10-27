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
  // 新加的一栏：已掌握的单词。
  // 老存档里没有 mastered 这个字段，读出来是 undefined，
  // 用 || [] 兜一下就变成空数组了 —— 所以不用升 KEY，进度也不会丢
  mastered: archive && archive.mastered ? archive.mastered : [],
  index: initialIndex
})

watch(store, () => {
  localStorage.setItem(KEY, JSON.stringify(store))
}, { deep: true })

/**
 * 从后端拿词。
 *
 * 地址写 /api/words 而不是 http://127.0.0.1:8080/api/words ——
 * 因为请求要「先经过」Vite 的代理，再由代理转给 Spring。
 * 写成完整地址就绕过了代理，浏览器会直接向 8080 发请求，那就变成跨域了。
 */
export async function loadWords() {
  const res = await fetch('/api/words')

  // fetch 只有「网络不通」才算失败；4xx / 5xx 它照样 resolve。
  // 所以必须自己看一眼 ok，不然接口挂了你会拿到一个 null 还以为是空表
  if (!res.ok) {
    throw new Error('后端返回了 ' + res.status)
  }

  const list = await res.json()

  // result 从数据库读回来，不再强制清空 —— 这才是「接着背」的意思：
  // 上次答过「记得」的词，这次进来卡片上还标着「记得」
  //
  // 唯一无条件重置的是 expanded：它只表示「例句展开没展开」，是纯粹的界面状态，
  // 数据库里没存，每次进页面一律收起
  const toCard = (w) => ({
    word: w.word,
    meaning: w.meaning,
    example: w.example,
    result: w.result || '',
    expanded: false
  })

  // 一个接口拿回全部词，再按 status 分成两拨。
  // 已掌握不再单独建表、也不用再发第二个请求 —— 它就是同一批数据里的另一种状态
  store.words = list.filter((w) => w.status !== 'mastered').map(toCard)
  store.mastered = list
    .filter((w) => w.status === 'mastered')
    .map((w) => ({ word: w.word, meaning: w.meaning, example: w.example }))

  store.index = 0
}

/**
 * 从后端拿笔记。
 *
 * 和 loadWords 几乎一样，只有一个区别：笔记没有 result 字段（笔记不参与答题），
 * 但多补一个 expanded —— 那是「扩展讲解收没收起」的界面状态，数据库里没存，
 * 每次进来一律收起。
 *
 * 数据库返回的 Note 带 id，前端用不上，这里有意不往 store 里塞：
 * 界面靠 word 认人，多一个 id 只会让两份数据长得不一样。
 */
export async function loadNotes() {
  const res = await fetch('/api/notes')

  if (!res.ok) {
    throw new Error('后端返回了 ' + res.status)
  }

  const list = await res.json()

  store.notes = list.map((n) => ({
    word: n.word,
    meaning: n.meaning,
    example: n.example,
    expanded: false
  }))
}

/**
 * 存一次作答结果（'记得' / '不记得'）。
 *
 * 注意 body 里只放一个 result 字段。后端那边用 Map 接，不是整个 Word ——
 * 改一个字段不需要把单词、释义、例句再传一遍，那些东西数据库里本来就有。
 */
export async function saveResult(word, result) {
  const res = await fetch(`/api/words/${encodeURIComponent(word)}/result`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result })
  })

  if (!res.ok) {
    throw new Error('后端返回了 ' + res.status)
  }
}

/**
 * 清空所有作答结果，对应「重新背一遍」。
 *
 * 注意 URL 是 /api/words/results（复数），作用对象是「所有结果」，
 * 不是某一个词。别和 /api/words/{word}/result 搞混。
 */
export async function resetResults() {
  const res = await fetch('/api/words/results', { method: 'DELETE' })

  if (!res.ok) {
    throw new Error('后端返回了 ' + res.status)
  }
}
