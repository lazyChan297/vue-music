<template lang="html">
  <div class="singer" ref="singer">
    <list-view
      ref="list"
      :data="singers"
      @selectItem="selectItem" />
    <router-view/>
  </div>
</template>

<script>
import {getSingerList} from '@/api/singer'
import {ERR_OK} from '@/api/config'
import Singer from '@/common/js/singer'
import ListView from '@/base/listview/listview'
import {mapMutations} from 'vuex'
import {playlistMixin} from '@/common/js/mixin'
const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10
export default {
  mixins: [playlistMixin],
  data() {
    return {
      singers: []
    }
  },
  components: {
    ListView
  },
  created() {
    this._getSingerList()
  },
  methods: {
    handlePlaylist(playlist) {
      const bottom = playlist.length > 0 ? '70px' : ''
      this.$refs.singer.style.bottom = bottom
      this.$refs.list.refresh()
    },
    _getSingerList() {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = res.data.list
          this.singers = this.normalizeSinger(this.singers)
        }
      })
    },
    // 格式化数据
    normalizeSinger(list) {
      // 分成热门、字母开头的数组
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        // 首字母
        const key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })
      // 分成热门和字母开头的两个数组
      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // 字母排序 返回一个从A-Z的数组
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    selectItem(singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      console.log(singer)
      this.setSinger(singer)
    },
    // 当前歌手
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  }
}
</script>

<style lang="stylus">
  .singer
    position: fixed
    bottom: 0
    width: 100%
    top:88px
    overflow: hidden
    .singer-content
      height: 100%;
      overflow: hidden;
</style>
