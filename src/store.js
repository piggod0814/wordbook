import { reactive, watch } from 'vue'

const KEY = 'word-app'

const defaultData = {
  words: [
    {
      word: 'apple',
      meaning: '苹果',
      result: '',
      expanded: false,
      example: '可数名词，前面要用 an。例句：An apple a day keeps the doctor away.（一天一苹果，医生远离我。）'
    },
    {
      word: 'banana',
      meaning: '香蕉',
      result: '',
      expanded: false,
      example: '可数名词。一串香蕉是 a bunch of bananas。例句：She peeled a banana.（她剥了一根香蕉。）'
    },
    {
      word: 'orange',
      meaning: '橙子（也可作形容词：橙色的）',
      result: '',
      expanded: false,
      example: '例句：The sky turned orange at dusk.（黄昏时天空变成了橙色。）'
    }
  ],
  notes: []
}

const saved = localStorage.getItem(KEY)

// 原始词表的备份：词被筛空之后，靠它「重新背一遍」。
// 必须深拷贝一份，否则它和 store 里的词是同一批对象，会被 result 污染
export const defaultWords = JSON.parse(JSON.stringify(defaultData.words))

export const store = reactive(saved ? JSON.parse(saved) : defaultData)

watch(store, () => {
  localStorage.setItem(KEY, JSON.stringify(store))
}, { deep: true })
