<template lang="html">
    <div class="m-header">
      <div class="icon"></div>
      <div class="text">
        Easy music
      </div>
      <router-link to="/user" class="mine" tag="div">
        <i class="icon-mine"></i>
      </router-link>
    </div>
</template>

<script>
export default {
}
</script>

<style lang="stylus">
  .m-header
    position: fixed
    top: 0
    width: 100%
    text-align: center
    height: 44px
    line-height: 44px
    background: #31c27c
    color: #fff
    .icon
      display: inline-block
      vertical-align: top
      margin-top: 6px
      width: 30px
      height: 32px
      margin-right: 9px
      bg-image('logo')
      background-size: 30px 32px
    .text
      display: inline-block
      vertical-align: top
      line-height: 44px
      font-size: $font-size-large
      margin-right: 44px
    .mine
      position: absolute
      top: 0
      right: 0
      .icon-mine
        display: block
        padding: 12px
        font-size: 20px
        color: $color-theme
</style>
