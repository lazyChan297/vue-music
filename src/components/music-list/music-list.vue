<template lang="html">
  <div class="music-list">
    <!-- 后退按钮 -->
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <!-- 标题 -->
    <h2 class="title">{{title}}</h2>
    <!-- 歌手/专辑封面 -->
    <div class="bgImage" :style="bgStyle" ref="bgImage">
      <!-- 播放按钮 -->
      <div class="player" ref="player" @click="random">
        <span>随机播放歌曲</span>
      </div>
    </div>
    <!-- 滚动遮罩层 -->
    <div class="bgLayer" ref="layer">

    </div>
    <!-- 歌曲列表 -->
    <scroll
      ref="songList"
      class="songList"
      :listen-scroll="listenScroll"
      :probe-type="probeType"
      @scroll="scrollSongList"

    >
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="selectItem" :rank="rank"></song-list>
      </div>
      <!-- loading -->
      <div class="loading-wrapper">
        <loading v-show="!songs.length"></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import SongList from '@/base/song-list/song-list'
import Scroll from '@/base/scroll/scroll'
import {prefixStyle} from '@/common/js/dom'
import {mapActions, mapMutations} from 'vuex'
import Loading from '@/base/loading/loading'
// 需要添加前缀的样式
const transform = prefixStyle('transform')
// 滚动预留高度
const HEIGHT = 40
export default {
  props: {
    songs: {
      type: Array,
      default: null
    },
    title: {
      type: String
    },
    bgImage: {
      type: String
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.probeType = 3
    this.listenScroll = true
  },
  computed: {
    bgStyle() {
      return `background-image:url(${this.bgImage})`
    }
  },
  watch: {
    scrollY(newY) {
      let zIndex = 0
      let translateY = Math.max(this.mintranslateY, newY)
      // console.log(newY)
      this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
      // 往下滑 滑动到顶部再往下拉时 图片放大
      let scale = 1
      if (newY > 0) {
        // 放大的百分比
        const percent = Math.abs(newY / this.imageHeight)
        scale = 1 + percent
        zIndex = 1
      }
      // 滑动到顶部
      if (newY < this.mintranslateY) {
        zIndex = 1
        this.$refs.bgImage.style.height = `${HEIGHT}px`
        this.$refs.bgImage.style.paddingTop = 0
        this.$refs.player.style.display = 'none'
      } else {
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = 0
        this.$refs.player.style.display = ''
      }
      this.$refs.bgImage.style.zIndex = zIndex
      this.$refs.bgImage.style[transform] = `scale(${scale})`
    }
  },
  data() {
    return {
      scrollY: -1
    }
  },
  mounted() {
    this.$refs.songList.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.mintranslateY = -this.imageHeight + HEIGHT
  },
  components: {
    Scroll,
    SongList,
    Loading
  },
  methods: {
    back() {
      this.$router.back()
    },
    scrollSongList(pos) {
      this.scrollY = pos.y
    },
    selectItem(item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    random() {
      this.randomPlay({
        list: this.songs
      })
    },
    ...mapMutations({
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  }
}
</script>

<style lang="stylus">
  .music-list
    position:fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: #fff
    .back
      position:absolute
      z-index:2
    .icon-back
      color: #31c27c
      display: inline-block
      margin: 11px 0 11px 12px
    .title
      position: absolute
      top: 0
      line-height: 40px
      left: 50%
      transform: translate3d(-50%,0,0)
      text-overflow: ellipsis
      white-space: nowrap
      overflow: hidden
      max-width: 300px
      z-index:2
    .bgImage
      position: relative
      height:0
      width: 100%
      padding-top:70%
      background-size:cover
    .bgLayer
      height:100%
      background:#fff
    .wrapper.songList
      position:absolute
      padding:0 30px
      box-sizing: border-box
      bottom:50px
      box-sizing: border-box
      width: 100%
      .loading-wrapper
        position: fixed
        left: 50%
        top: 300px
        transform: translate3d(-50%,0,0)
    .player
      border-radius: 20px
      position: absolute
      left: 50%
      transform: translate3d(-50%,0,0)
      bottom: 20px
      font-size:14px
      padding:0 10px
      height: 40px
      width: 190px
      line-height: 32px
      background-color: #22d59c;
      text-align: center;
      line-height: 40px;
      .icon-play
        color:#31c27c
        margin:0 5px
      span
        color: #fff
</style>
