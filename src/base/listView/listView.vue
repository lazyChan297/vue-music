<template lang="html">
  <scroll class="listview"
          :data="data"
          ref="listview"
          :listenScroll="listenScroll"
          :proxy-type="probeType"
          @scroll="scrollList">

    <!-- 歌手列表 -->
    <ul>
      <li v-for="(group,gindex) in data" class="list-group" ref="listGroup" :key="gindex">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li @click="selectItem(item)"
              v-for="(item, index) in group.items"
              class="list-group-item"
              :key="index"
            >
            <img v-lazy="item.avatar" alt="" class="avatar"/>
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 快速查询列表 -->
    <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
        <ul>
          <li v-for="(item, index) in shortChuList" :data-index="index" class="list-shortcut-item" :class="{active:currentIndex===index}" :key="index">{{item}}</li>
        </ul>
    </div>
    <!-- 固定title -->
    <div class="fixed-title" v-show="fixedTitle" ref="fixedTitle">
      {{fixedTitle}}
    </div>
    <!-- loading -->
    <loading v-show="!data.length"></loading>
  </scroll>
</template>

<script>
import Scroll from '@/base/scroll/scroll'
import {getData} from '@/common/js/dom'
import Loading from '@/base/loading/loading'
// 锚点固定高度
const ANCHOR_HEIGHT = 16
// 固定标题栏高度
const FIXEDTITLE_HEIGHT = 30
export default {
  props: {
    data: {
      type: Array
    }
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      listHeight: [],
      diff: -1
    }
  },
  created() {
    this.touch = {}
    this.probeType = 3
    this.listenScroll = true
  },
  computed: {
    // 快速查询字母表
    shortChuList() {
      // 返回字母开头的新数组
      return this.data.map((group) => {
        return group.title.substring(0, 1)
      })
    },
    // 固定标题
    fixedTitle() {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : false
    }
  },
  components: {
    Scroll,
    Loading
  },
  watch: {
    // 列表发生变化时重新计算高度
    data() {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    scrollY(newY) {
      const listHeight = this.listHeight
      // 滚动到顶部
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 中间部分滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        // 如果滚动到最后一个或者没有发生滚动
        if ((-newY) >= height1 && (-newY) < height2) {
          this.currentIndex = i
          this.diff = height2 + newY
          return
        }
      }
      // 当滚动到底部，且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    },
    // 下一个列表
    diff(newVal) {
      let fixedTop = (newVal > 0 && newVal < FIXEDTITLE_HEIGHT) ? newVal - FIXEDTITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixedTitle.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  methods: {
    onShortcutTouchStart(e) {
      let anchorIndex = getData(e.target, 'index')
      this.touch.y1 = e.touches[0].pageY
      this.touch = {
        y1: e.touches[0].pageY,
        anchorIndex: anchorIndex
      }
      this.scrollTo(anchorIndex)
    },
    onShortcutTouchMove(e) {
      let delta = (e.touches[0].pageY - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this.scrollTo(anchorIndex)
    },
    // 点击进入歌手详情页面
    selectItem(item) {
      this.$emit('selectItem', item)
    },
    scrollTo(index) {
      // 滚动到顶部再网上滑时 右侧索引第一个保持高亮
      if (index < 0) {
        index = 0
      }
      if (!index && index !== 0) {
        return
      }
      // 滚动到底部再往下滑时 右侧最后一个保持高亮
      if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      this.scrollY = -this.listHeight[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 500)
    },
    scrollList(pos) {
      this.scrollY = pos.y
    },
    refresh() {
      this.$refs.listview.refresh()
    },
    // 计算每一个姓的列表高度
    _calculateHeight() {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i].clientHeight
        height += item
        this.listHeight.push(height)
      }
    }
  }
}
</script>

<style lang="stylus">
  @import "~common/stylus/variable"
  .listview
    height:100%
    overflow:hidden
    .list-group-title
      height:30px
      font-size:12px
      line-height:30px
      color:$color-text-l
      background:#333
      padding-left:12px
    .list-group-item
      padding:20px 20px 0
      box-sizing: border-box
    .avatar
      display:inline-block
      height:50px
      width:50px
      border-radius:50%
      vertical-align:middle
    .name
      display:inline-block
      margin-left:10px
      color:$color-text-l
    .list-shortcut
      position: absolute
      padding: 20px 0
      right: 0
      top: 50px
      width: 30px
      text-align: center
      color:$color-text-l
      font-size:12px
      .list-shortcut-item
        height:16px
        line-height: 16px
        &.active
          color:$color-theme
    .fixed-title
      position: absolute
      width: 100%
      top: 0
      padding-left: 12px
      height: 30px
      font-size: 12px
      line-height: 30px
      color: rgba(255,255,255,0.5)
      background: #333
    .loading
      position: absolute
      top: 50%
      transform: translate3d(0,-50%,0)
</style>
