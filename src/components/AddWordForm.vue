<template>
  <div class="add-form">
    <label class="field">
      <span class="label">单词</span>
      <input v-model.trim="word" class="input" placeholder="例如：abandon" />
    </label>

    <label class="field">
      <span class="label">中文意思</span>
      <input v-model.trim="meaning" class="input" placeholder="例如：v. 放弃，抛弃" />
    </label>

    <label class="field">
      <span class="label">例句（可留空）</span>
      <textarea
        v-model.trim="example"
        class="input textarea"
        rows="3"
        placeholder="例如：He abandoned the plan.（他放弃了这个计划。）"
      ></textarea>
    </label>

    <!-- 校验没通过的提示，平时是空字符串，所以整行不显示 -->
    <p v-if="tip" class="tip">{{ tip }}</p>

    <van-button class="submit" type="primary" size="large" @click="submit">
      保存到词库
    </van-button>
  </div>
</template>

<script>
export default {
  name: 'AddWordForm',

  data() {
    return {
      word: '',
      meaning: '',
      example: '',
      tip: ''
    }
  },

  methods: {
    submit() {
      // 只要有一个是空的就拦下来。
      // 空字符串 '' 在 JS 里本身就是「假」，所以 !this.word 同时能挡住 ''
      // 和「压根没这个值」两种情况，比自己写 == null 稳
      if (!this.word || !this.meaning) {
        this.tip = '单词和中文意思都要填'
        return
      }

      this.tip = ''

      // 交出去：事件名 'add' 必须和父组件 @add 一字不差
      this.$emit('add', {
        word: this.word,
        meaning: this.meaning,
        example: this.example
      })

      // 清空。注意要清成空字符串 ''，不是 null ——
      // data 里它们的初始值就是 ''，保持同一种「空」最省心
      this.word = ''
      this.meaning = ''
      this.example = ''
    }
  }
}
</script>

<style scoped>
.add-form {
  background: #fff;
  border-radius: var(--radius-card);
  box-shadow: var(--card-shadow);
  padding: 20px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ink-2);
}

.input {
  width: 100%;
  font-family: inherit;
  font-size: 15px;
  color: var(--ink);
  background: #fafbfe;
  border: 1px solid var(--edge);
  border-radius: var(--radius-btn);
  padding: 11px 12px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}

.input::placeholder {
  color: var(--ink-3);
}

.input:focus {
  background: #fff;
  border-color: var(--brand);
}

.textarea {
  resize: none;
  line-height: 1.6;
}

.tip {
  margin: -4px 0 0;
  font-size: 12.5px;
  color: var(--van-danger-color);
}

.submit {
  height: 50px;
  font-size: 15px;
  font-weight: 700;
  border-radius: var(--radius-btn);
}
</style>
