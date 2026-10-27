<!-- ① 这一段决定【屏幕上长什么样】 -->
<template>
  <div class="word-card">

  <div v-if="words.length > 0">
    <p class="word">{{ words[index].word }}</p>
    <p v-if="showMeaning">{{ words[index].meaning }}</p>
    <p>这张卡：{{ words[index].result }}</p>

    <button @click="remember">记得</button>
    <button @click="forget">不记得</button>
    <button v-if="words[index].result === '不记得'" @click="toggleExample">扩展</button>
    <p v-if="words[index].expanded">{{ words[index].example }}</p>

    <p>记得：{{rememberCount}} 个</p>
    <p>不记得：{{forgetCount}} 个</p>
    <button @click="next">下一个</button>
    <button @click="addNote">添加至笔记</button>
  </div>

  <p v-else>全部背完了</p>

</div>

</template>


<script>
import { store } from '../store.js'
export default {
  name: 'WordCard',

        data() {
  return {
    index: 0,
    showMeaning: false,
    rememberCount: 0,
    forgetCount: 0
  }
},

computed: {
  words() {
    return store.words
  }
},



    methods: {

        remember() {
      console.log('我点了记得')
      this.rememberCount++ 
      this.showMeaning = true
      this.words[this.index].result = '记得'
    },  
        forget(){
            console.log('我点了不记得')
            this.forgetCount++
            this.showMeaning = true
            this.words[this.index].result = '不记得'
        },
        next(){
          this.showMeaning=false
          if(this.index<this.words.length-1){
          this.index++} 
          else {
          store.words = store.words.filter(w => w.result === '不记得')
          this.index = 0
        }
        },
        addNote() {
        const current = this.words[this.index]
        const exists = store.notes.some(n => n.word === current.word)
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
      const current = this.words[this.index]
      current.expanded = !current.expanded
    }




  }

}
</script>


<!-- ③ 这一段决定【长得好不好看】，现在可以先空着 -->
<style scoped>
/* scoped 的意思是：这里的样式只管这个零件，不影响别的地方 */

.word-card {
  /* 这里填：卡片的样子。先不管也行 */
}

.word {
  /* 这里填：单词的字号大一点 */
}
</style>
