<template lang="html">
  <div class="progress-bar" ref="barWidth" @click="progressClick">
    <!-- 歌曲总长度 -->
    <div class="bar-inner">
      <!-- 当前播放时长高亮部分 -->
      <div class="progress" ref="progress"></div>
      <!-- 控制播放进度的按钮 -->
      <div class="progress-btn-wrapper" ref="progressBtn"
            @touchstart.prevent="progressTouchStart"
            @touchmove.prevent="progressTouchMove"
            @touchend.prevent="progressTouchEnd"
            >
        <div class="progress-btn">

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {prefixStyle} from '@/common/js/dom'
// 按钮宽度
const PROGRESS_WIDTH = 16
const transform = prefixStyle('transform')
export default {
  props: {
    percent: Number,
    default: 0
  },
  created() {
    this.touch = {}
  },
  methods: {
    progressTouchStart(e) {
      // 开始移动
      this.touch.initiated = true
      // 开始位置
      this.touch.startX = e.touches[0].pageX
      // 按钮偏移位置 歌曲播放点
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 进度条总宽度
      const barWidth = this.$refs.barWidth.clientWidth
      const offsetWidth = Math.min(barWidth, Math.max(deltaX, this.touch.left + deltaX))
      this._offsetWidth(offsetWidth)
    },
    progressTouchEnd(e) {
      this.touch.initiated = false
      this._triggerPercent()
    },
    _offsetWidth(width) {
      this.$refs.progress.style.width = `${width}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${width}px,0,0)`
    },
    _triggerPercent() {
      // barWidth
      const barWidth = this.$refs.barWidth.clientWidth
      // clientWidth
      const clientWidth = this.$refs.progress.clientWidth
      const percent = clientWidth / barWidth
      // 基础组件不做任何业务逻辑上的处理,所以将改变的结果在父组件触发
      this.$emit('percentChange', percent)
    },
    // 从指定位置开始播放
    progressClick(e) {
      this._offsetWidth(e.offsetX)
      this._triggerPercent()
    }
  },
  watch: {
    percent(newVal) {
      if (newVal >= 0 && !this.touch.initiated) {
        if (newVal >= 0) {
          const barWidth = this.$refs.barWidth.clientWidth - PROGRESS_WIDTH
          const offsetWidth = newVal * barWidth
          this._offsetWidth(offsetWidth)
        }
      }
    }
  }
}
</script>

<style lang="stylus">
@import "~common/stylus/variable"

.progress-bar
  height: 30px
  .bar-inner
    position: relative
    top: 13px
    height: 4px
    background: rgba(0, 0, 0, 0.3)
    .progress
      position: absolute
      height: 100%
      background: $color-theme
    .progress-btn-wrapper
      position: absolute
      left: -8px
      top: -13px
      width: 30px
      height: 30px
      .progress-btn
        position: relative
        top: 7px
        left: 7px
        box-sizing: border-box
        width: 16px
        height: 16px
        border: 3px solid $color-text-ll
        border-radius: 50%
        background: $color-theme
</style>
