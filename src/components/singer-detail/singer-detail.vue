<template lang="html">
  <transition name="slide">
    <music-list
      :title="singer.name"
      :bgImage="singer.avatar"
      :songs="songs"
    >
  </music-list>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSingerDetail } from '@/api/singer'
import { ERR_OK } from '@/api/config'
import { createSong, processSongsUrl } from '@/common/js/song'
import MusicList from '../music-list/music-list'
export default {
  data() {
    return {
      songs: []
    }
  },
  computed: {
    ...mapGetters([
      'singer'
    ])
  },
  created() {
    setTimeout(() => {
      // 根据歌手id获取ta的歌曲列表
      this._getSingerDetail(this.singer.id)
    }, 20)
  },
  components: {
    MusicList: MusicList
  },
  methods: {
    // 获取歌手的歌曲列表
    _getSingerDetail(id) {
      if (!this.singer.id) {
        // 防止刷新了当前页 state.singer 为空请求不到数据
        this.$router.push('/singer')
        return
      }
      getSingerDetail(id).then(res => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._nomalizeSongs(res.data.list)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    // 实例化歌手的列表歌曲 拥有{lyric, mid,singer,album,durations,id,mid,name}属性
    _nomalizeSongs(list) {
      let ret = []
      list.forEach((item, index) => {
        let {musicData} = item
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  }
}
</script>

<style lang="stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s
  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
  .loading-wrapper
    position: absolute
    left: 50%
    top: 50px
    transform: translate3d(-50%,0,0)
</style>
