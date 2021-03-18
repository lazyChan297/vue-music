<template lang="html">
  <div class="search-box">
    <i class="icon-search"></i>
    <input type="text" name=""  class="box" value="" :placeholder="placeholder" v-model="query" ref="query">
    <i class="icon-dismiss" v-show="query" @click="clear"></i>
  </div>
</template>

<script>
import {debounce} from '@/common/js/util'
export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  created() {
    // this.$watch('query', (newQuery) => {
    //   this.$emit('query', newQuery)
    // })
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery)
    }, 200))
  },
  data() {
    return {
      query: ''
    }
  },
  methods: {
    clear() {
      this.query = ''
    },
    setQuery(query) {
      this.query = query
      this.$emit('query', query)
    },
    blur() {
      this.$refs.query.blur()
    }
  }
}
</script>

<style lang="stylus">
@import "~common/stylus/variable"

.search-box
  display: flex
  align-items: center
  box-sizing: border-box
  width: 100%
  padding: 0 6px
  height: 40px
  border-radius: 6px
  background: #dedede
  .icon-search
    font-size: 24px
    color: $color-text
  .box
    flex: 1
    margin: 0 5px
    line-height: 18px
    color: $color-text
    font-size: $font-size-medium
    background: #dedede
    outline: 0
    height: 100%
    color: $color-text
    &::placeholder
      color: $color-text
  .icon-dismiss
    font-size: 16px
    color: $color-background
</style>
