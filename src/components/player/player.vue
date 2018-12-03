<template lang="html">
  <div class="player" v-show="playlist.length>0">
    <!-- 全屏播放器 -->
      <transition name="normal"
                  @enter="enter"
                  @after-enter="afterEnter"
                  @leave="leave"
                  @after-leave="afterLeave">
        <div class="normal-player" v-show="fullScreen">
        <!-- 背景图片 -->
          <div class="background">
            <img :src="currentSong.image" alt="" width="100%" height="100%">
          </div>
          <!-- 顶部 -->
          <div class="top">
            <!-- 收起按钮 -->
            <div class="back" @click="back">
              <i class="icon-back"></i>
            </div>
            <h2 class="title">{{currentSong.name}}</h2>
            <div class="subtitle">
              {{currentSong.singer}}
            </div>
          </div>
          <!-- middle  cd-->
          <div class="middle"
               @touchstart.prevent="middleTouchStart"
               @touchmove.prevent="middleTouchMove"
               @touchend="middleTouchEnd"
          >
            <div class="middle-l" ref="middleL">
              <!-- cd -->
              <div class="cd-wrapper" ref="cdWrapper" >
                <div class="cd" :class="cdClass">
                  <img :src="currentSong.image" alt="" >
                </div>
              </div>
              <!-- cd 显示的单行歌词 -->
              <div class="playing-lyric-wrapper">
                <div class="play-lyric">
                  {{playingLyric}}
                </div>
              </div>
            </div>
            <!-- 歌词 -->
            <scroll class="middle-r" :data="currentLyric && currentLyric.lines" ref="lyricList">
              <div class="lyric-wrapper" ref="lyricWrapper">
                <div class="lyric" v-if="currentLyric">
                  <p v-for="(item,index) in currentLyric.lines"
                     class="text"
                     ref="lyricLine"
                     :key="index"
                     :class="{'current':currentLineNum===index}"
                  >
                      {{item.txt}}
                  </p>
                </div>
              </div>
            </scroll>
          </div>
          <!-- bottom 操作播放 -->
          <div class="bottom">
            <!-- 切换歌词cd的分页器 -->
            <div class="dot-wrapper">
              <span class="dot" :class="{'active':currentShow==='cd'}"></span>
              <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
            </div>
            <!-- 播放时间和进度条 -->
            <div class="progress-wrapper">
              <span class="time-l">{{format(currentTime)}}</span>
              <!-- progressBar -->
              <div class="progress-bar-wrapper">
                <progress-bar :percent="percent" @percentChange="percentChange"></progress-bar>
              </div>
              <span class="time-r">{{format(currentSong.duration)}}</span>
            </div>
            <div class="operators">
              <div class="icon i-left" @click="changeMode">
                <i :class="iconMode"></i>
              </div>
              <div class="icon i-left" :class="disableCls">
                <i class="icon-prev" @click="prev"></i>
              </div>
              <div class="icon i-center" :class="disableCls">
                <i :class="playIcon" @click="togglePlaying"></i>
              </div>
              <div class="icon i-right" :class="disableCls">
                <i class="icon-next" @click="next"></i>
              </div>
              <div class="icon i-right">
                <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
              </div>
            </div>
          </div>

        </div>
    </transition>
    <!-- 底部播放器 -->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <div class="imgWrapper" :class="cdClass">
            <img :src="currentSong.image" alt="" width="40" height="40">
          </div>
        </div>
        <div class="text">
          <p class="name">{{currentSong.name}}</p>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <!-- 当音频能够播放时会触发canplay事件 -->
          <progress-circle :radius="radius" :percent="percent">
            <i class="icon-mini" :class="miniPlayIcon" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist" @click.stop="showPlayList"></i>
        </div>
      </div>
    </transition>
    <play-list ref="playlist"></play-list>
    <audio :src="currentSong.url" ref="audio"  @playing="ready" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from '@/common/js/dom'
import ProgressBar from '@/base/progress-bar/progress-bar'
import ProgressCircle from '@/base/progress-circle/progress-circle'
import {playMode} from '@/common/js/config'
import Lyric from 'lyric-parser'
import Scroll from '@/base/scroll/scroll'
import PlayList from '@/components/playlist/playlist'
import {playerMixin} from '@/common/js/mixin'
const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
  mixins: [playerMixin],
  data() {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: null
    }
  },
  created() {
    this.touch = {}
  },
  computed: {
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    cdClass() {
      return this.playing ? 'play' : 'play pause'
    },
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniPlayIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    ...mapGetters([
      'fullScreen',
      'playing',
      'currentIndex'
    ])
  },
  methods: {
    back() {
      this.setfullScreen(false)
    },
    open() {
      this.setfullScreen(true)
    },
    // 进入播放器前 将cd大图移动到mini播放器小图的坐标和缩小
    enter(el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0px, 0px, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0px, 0px, 0) scale(1)`
        }
      }
      // 注册动画
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 1000,
          easing: 'linear'
        }
      })
      // 运行动画
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    // 进入player后取消动画 清空cd大图上的transform的样式
    afterEnter() {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    // 离开player 再次将cd大图移动到mini播放器位置并缩小
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      const timer = setTimeout(done, 400)
      this.$refs.cdWrapper.addEventListener('transitionend', () => {
        clearTimeout(timer)
        done()
      })
    },
    // 离开后 恢复原有样式
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    _getPosAndScale() {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      // cd大图width
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      // cd大图到底部mini播放器x轴偏移量
      const x = -(window.innerWidth / 2 - paddingLeft)
      // cd大图到底部mini播放器y轴偏移量
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    togglePlaying() {
      // 歌曲没有准备好
      if (!this.songReady) {
        return
      }
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
      this.setPlayingState(!this.playing)
    },
    prev() {
      // 歌曲没有准备好
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === 0) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      // 播放后将songReady重新设为false
      this.songReady = false
    },
    next() {
      // 歌曲没有准备好
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      }
      let index = this.currentIndex + 1
      if (index === this.playlist.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      // 播放后将songReady重新设为false
      this.songReady = false
    },
    ready() {
      // 当切换歌曲 or 开始播放歌曲时会触发
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    error() {
      this.songReady = true
    },
    updateTime(e) {
      this.currentTime = e.target.currentTime
    },
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      // this.setPlayingState(true)
      if (this.currentLyric) {
        // seek() 可以将歌曲的偏移回到原来位置
        this.currentLyric.seek()
      }
    },
    end() {
      this.currentTime = 0
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    // 格式化歌曲时间
    format(interval) {
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    // 正在播放的时间格式是 00:00 当秒数为个位数时（0:1）需要在前面补零
    _pad(num, n = 2) {
      // num需要补零的数字 n要补的位数
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    percentChange(percent) {
      const currentTime = percent * this.currentSong.duration
      // 假如歌曲暂停后再拖动，拖动结束后要将playing改为tru
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.togglePlaying(true)
      }
      // 进度条改变 歌词滚动位置也需要改变
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    // 打开歌曲列表
    showPlayList() {
      this.$refs.playlist.show()
    },
    // 解析歌词数据结构
    getLyric() {
      this.currentSong.getLyric().then((lyric) => {
        // 如果当前的歌词不等于解析后的
        if (this.currentSong.lyric !== lyric) {
          return
        }
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        } else {
          this.currentLyric.stop()
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    handleLyric({lineNum, txt}) {
      this.currentLineNum = lineNum
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart(e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      // 如果滚动时，手指在Y轴方向大于X轴 什么也不做
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }

      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      // 记录歌词dom的初始位置
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd() {
      let offsetWidth = 0
      let opacity = 0
      // 从右向左 显示歌词
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          this.currentShow = 'lyric'
          opacity = 0
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        // 从左向右 隐藏歌词
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `300ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `300ms`
    },
    ...mapMutations({
      setfullScreen: 'SET_FULL_SCREEN',
      setCurrentIndex: 'SET_CURRENT_INDEX'
    }),
    ...mapActions([
      'savePlayHistory'
    ])
  },
  watch: {
    currentSong(newVal, oldVal) {
      if (!newVal.id || newVal.id === oldVal) {
        return
      }
      // 切换歌曲时 歌词滚动需要重新计算 将原有的清空
      if (this.currentLyric) {
        // 停止歌词滚动
        this.currentLyric.stop()
        // 重置当前的歌词对象为null
        this.currentLyric = null
        // 重置当前滚动到的行数
        this.currentLineNum = 0
        // 重置当前显示的单行歌词
        this.playingLyric = ''
        // 重置当前播放时间
        this.currentTime = 0
      }
      clearTimeout(this.timer)
      //  1s后重新请求歌词和播放
      this.timer = setTimeout(() => {
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
    },
    playing(newVal) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newVal ? audio.play() : audio.pause()
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    PlayList
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"
  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: .6
        filter: blur(20px)
      .top
        .back
          position: absolute;
          left: 6px;
          top: 0;
          .icon-back
            display: block
            padding: 9px
            font-size: 22px
            color: #ffcd32
            transform: rotate(-90deg)
        .title
          text-align:center
          line-height: 40px
        .subtitle
          margin:0 70px
          text-align:center
     .middle
       position: fixed
       width: 100%
       top: 80px
       bottom: 170px
       white-space: nowrap
       font-size: 0
       .middle-l
        display: inline-block
        vertical-align: top
        position: relative
        width: 100%
        height: 0
        padding-top: 80%
        .cd-wrapper
          position: absolute
          left: 10%
          top: 0
          width: 80%
          box-sizing: border-box
          height: 100%
          .cd
            width: 100%
            height: 100%
            border-radius: 50%
            &.play
              animation:rotate 10s linear infinite
            &.pause
              animation-play-state:paused
            img
              position: absolute
              left: 0
              top: 0
              width: 100%
              height: 100%
              box-sizing: border-box
              border-radius: 50%
              border: 10px solid hsla(0,0%,100%,.1)
        .playing-lyric-wrapper
          .play-lyric
            color: rgba(255, 255, 255, 0.5)
            line-height: 20px
            font-size: 15px
            text-align: center
            margin: 30px 0 0
       .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: rgba(255, 255, 255, 0.5)
              font-size: 14px
              &.current
                color: $color-text
            .pure-music
              padding-top: 50%
              line-height: 32px
              color: #fff
              font-size: 12px
     .bottom
      position: absolute
      bottom: 50px
      width: 100%
      .dot-wrapper
        text-align: center
        font-size: 0
        .dot
          display: inline-block
          vertical-align: middle
          margin: 0 4px
          width: 8px
          height: 8px
          border-radius: 50%
          background: $color-text-l
          &.active
            width: 20px
            border-radius: 5px
            background: $color-text-ll
      .progress-wrapper
        display:flex
        padding:10px 0
        align-items: center
        width:80%
        margin:0 auto
        box-sizing: border-box
        .progress-bar-wrapper
          flex:1
        span
          line-height:30px
          -webkit-box-flex: 0
          flex:0 0 30px
          width:30px
          display:block
          &.time-l
            text-align:left
            margin-right:6px
          &.time-r
            text-align:right
            margin-left:6px
      .operators
        display:flex
        .icon
          flex:1
          font-size:30px
          color:#ffcd32
          &.disable
            color: $color-theme-d
          &.i-left
            text-align:right
          &.i-right
            text-align:left
          &.i-center
            text-align:center
            padding:0 20px
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: #333
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        .imgWrapper
          width:100%
          height:100%
          .cd
          &.play
            animation:rotate 10s linear infinite
          &.pause
            animation-play-state:paused
          img
            border-radius:50%
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .desc
          text-overflow: ellipsis
          white-space: nowrap
          overflow: hidden
          font-size: 14px
      .control
        padding: 0 10px
        .icon-mini
          position:absolute
          font-size: 32px
          left: 0
          top: 0
          color:rgba(255,205,49,.5)
        .icon-playlist
          font-size:30px
          color:rgba(255,205,49,.5)
    @keyframes rotate
      0%
        transform: roteta(0)
      100%
        transform: rotate(360deg)
</style>
