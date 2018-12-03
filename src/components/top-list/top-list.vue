<template lang="html">
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bgImage="bgImage" :rank="rank"></music-list>
  </transition>
</template>

<script>
import MusicList from '@/components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getMusicList} from '@/api/rank'
import {ERR_OK} from '@/api/config'
import {createSong, processSongsUrl} from '@/common/js/song'
export default {
  data() {
    return {
      songs: [],
      topinfo: {},
      rank: true
    }
  },
  created() {
    this._getMusicList(this.topList.id)
  },
  components: {
    MusicList
  },
  computed: {
    title() {
      return this.topinfo.ListName
    },
    bgImage() {
      return this.topinfo.pic_album
    },
    ...mapGetters([
      'topList'
    ])
  },
  methods: {
    _getMusicList(topid) {
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }
      getMusicList(topid).then((res) => {
        if (res.code === ERR_OK) {
          this.topinfo = res.topinfo
          processSongsUrl(this._normalizeSongs(res.songlist)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item, index) => {
        if (item.data.songid && item.data.albumid) {
          ret.push(createSong(item.data))
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
</style>
