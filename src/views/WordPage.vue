<template>
  <!-- 这一页只装一个零件。不再多套一层 div：
       多套一层会让 WordCard 里的 min-height:100% 找不到“父元素有多高”，
       卡片就撑不满一屏 -->
  <WordCard />
</template>

<script>
import WordCard from '../components/WordCard.vue'

export default {
  name: 'WordPage',
  components: { WordCard }
}
</script>
