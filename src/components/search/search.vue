<template lang="html">
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query.length"  ref="shortcutWrapper">
      <scroll :data="shortList" ref="shortcut" class="scroll-wrapper" style="height:100%" :refreshDelay="refreshDelay">
        <div>
          <!-- 热门搜索 -->
          <div class="shortcut">
            <div class="hot-key">
              <h1 class="title">热门搜索</h1>
              <ul>
                <li v-for="(item,index) in hotKey" :key="index" class="item" @click="addQuery(item.k)">{{item.k}}</li>
              </ul>
            </div>
          </div>
          <!-- 搜索历史 -->
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="cleae" @click="showConfirm"><i class="icon-clear"></i></span>
            </h1>
            <search-list :searches="searchHistory" @select="addQuery" @delete="deleteOne"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div v-show="query" class="search-result">
      <suggest :query="query" @listenScroll="blurInput" @select="saveSearch"></suggest>
    </div>
    <confirm ref="confirm" :text="text" @confirm="deleteAll"></confirm>
    <router-view/>
  </div>
</template>

<script>
import SearchBox from '@/base/search-box/search-box'
import {getHotKey} from '@/api/search'
import {ERR_OK} from '@/api/config'
import Suggest from '@/components/suggest/suggest'
import {mapActions} from 'vuex'
import SearchList from '@/base/search-list/search-list'
import Confirm from '@/base/confirm/confirm'
import Scroll from '@/base/scroll/scroll'
import {playlistMixin, searchMixin} from '@/common/js/mixin'
export default {
  mixins: [playlistMixin, searchMixin],
  data() {
    return {
      hotKey: [],
      text: '确定要清空搜索历史吗?',
      refreshDelay: 100
    }
  },
  created() {
    this._getHotKey()
  },
  computed: {
    shortList() {
      return this.hotKey.concat(this.searchHistory)
    }
  },
  watch: {
    query() {
      setTimeout(() => {
        this.$refs.shortcut.refresh()
      }, 20)
    }
  },
  methods: {
    _getHotKey() {
      getHotKey().then((res) => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.slice(0, 10)
        }
      })
    },
    deleteOne(item) {
      this.deleteSearchHistory(item)
    },
    deleteAll() {
      this.clearSearchHistory()
    },
    showConfirm() {
      this.$refs.confirm.show()
    },
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '70px' : ''
      this.$refs.shortcut.refresh()
      this.$refs.shortcutWrapper.style.bottom = bottom
    },
    ...mapActions([
      'clearSearchHistory'
    ])
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  }
}
</script>

<style lang="stylus">
@import "~common/stylus/variable"
@import "~common/stylus/mixin"

.search
  position: fixed
  width: 100%
  top: 88px
  bottom: 0
  .search-box-wrapper
    margin: 20px
  .shortcut-wrapper
    position: fixed
    top: 178px
    bottom:0
    width: 100%
    overflow:hidden
    .shortcut
      overflow: hidden
      .hot-key
        margin: 0 20px 20px 20px
        .title
          margin-bottom: 20px
          font-size: $font-size-medium
          color: $color-text-l
        .item
          display: inline-block
          padding: 5px 10px
          margin: 0 20px 10px 0
          border-radius: 6px
          background: $color-highlight-background
          font-size: $font-size-medium
          color: $color-text-d
    .search-history
        position: relative
        margin: 0 20px
        .title
          display: flex
          align-items: center
          height: 40px
          font-size: $font-size-medium
          color: $color-text-l
          .text
            flex: 1
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
  .search-result
    position: fixed
    width: 100%
    top: 178px
    bottom: 0
</style>
