<template lang="html">
  <div class="loading">
    <img width="24" height="24" src="./loading.gif">
    <p>{{title}}</p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '正在加载...'
    }
  }
}
</script>

<style lang="stylus">
  .loading
    width:100%
    text-align:center
    p
      line-height: 20px
      font-size: 12px
      color: hsla(0,0%,100%,.5)
</style>
