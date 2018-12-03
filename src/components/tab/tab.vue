<template lang="html">
  <div class="tab">
    <router-link to="/recommend" class="tab-item" tag="div"><span>推荐</span></router-link>
    <router-link to="/singer" class="tab-item" tag="div"><span>歌手</span></router-link>
    <router-link to="/rank" class="tab-item" tag="div"><span>排行</span></router-link>
    <router-link to="/search" class="tab-item" tag="div"><span>搜索</span></router-link>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="stylus">
  .tab
    display: flex
    position: fixed
    background: #222
    width: 100%
    top:44px
    height: 44px
    line-height: 44px
    .tab-item
      flex: 1
      text-align: center
      &.router-link-active
        span
          color: #ffcd32
          border-bottom: 2px solid #ffcd32
</style>
