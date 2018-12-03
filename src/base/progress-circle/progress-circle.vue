<!--
  mini Player 圆形进度条
    circle stroke-dasharray 虚线线条
           stroke-dashOffset 线条开始到结束的位置 开始点为最右边中间点顺时针方向延迟
                             假如 circle的周长为314 stroke-dashOffset值为157 则下半个圆出现线条
    第一个矢量圆形 circle 灰色圈圈
    第二个矢量圆形 显示进度条
    svg width height 为在屏幕上的宽高
    viewBox：x y w h
    如果circle的宽高和 viewBox的w，h一样则会完全显示在宽、高为32的svg标签上完整的显示circle
    如果circle的宽高小于 viewBox的w，h则会相应的缩小
    如果大于 则会不完全显示
-->
<template lang="html">
  <div class="progress-circle">
    <svg :width="radius" :height="radius" viewBox="0 0 100 100">
      <circle class="progress-background" r="50" cy="50" cx="50"
       fill="transparent" />
       <circle class="progress-bar" r="50" cy="50" cx="50"
        fill="transparent" :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    percent: {
      type: Number,
      default: 0
    },
    radius: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      // 周长
      dashArray: Math.PI * 100
    }
  },
  computed: {
    dashOffset() {
      return (1 - this.percent) * this.dashArray
    }
  }
}
</script>

<style lang="stylus">
@import "~common/stylus/variable"

.progress-circle
  position: relative
  circle
    stroke-width: 8px
    transform-origin: center
    &.progress-background
      transform: scale(0.9)
      stroke: $color-theme-d
    &.progress-bar
      transform: scale(0.9) rotate(-90deg)
      stroke: $color-theme
</style>
