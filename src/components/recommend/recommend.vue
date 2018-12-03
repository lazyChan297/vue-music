<template lang="html">
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div class="">
        <!-- Slider -->
        <div class="slider-wrapper" v-if="sliderList.length">
          <Slider>
            <div class="" v-for="(item, index) in sliderList" :key="index">
              <a :href="item.linkUrl">
                <img @load="loadImage" :src="item.picUrl" alt="">
              </a>
            </div>
          </Slider>
        </div>
        <!-- recommendList -->
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul class="discList">
            <li v-for="(item, index) in discList" class="discList-item" :key="index" @click="selectItem(item)">
              <div class="">
                <img v-lazy="item.imgurl" alt="" width="60" height="60">
              </div>
              <div class="discList-item-right">
                <p class="discList-item-name">{{item.creator.name}}</p>
                <p class="discList-item-dissname">{{item.dissname}}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- loading -->
      <div class="loading-container">
        <loading v-show="!discList.length"/>
      </div>
    </scroll>
    <router-view/>
  </div>
</template>

<script>
import {getRecommend, getDiscList} from '@/api/recommend'
import {ERR_OK} from '../../api/config'
import Slider from '../../base/slider/slider'
import Scroll from '@/base/scroll/scroll'
import Loading from '@/base/loading/loading'
import {playlistMixin} from '@/common/js/mixin'
import {mapMutations} from 'vuex'
export default {
  mixins: [playlistMixin],
  data() {
    return {
      sliderList: [],
      discList: []
    }
  },
  created() {
    this._getRecommend()
    this._getDiscList()
  },
  methods: {
    handlePlaylist(playlist) {
      if (playlist.length > 0) {
        const bottom = playlist.length > 0 ? '70px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      }
    },
    _getRecommend() {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.sliderList = res.data.slider
        }
      })
    },
    _getDiscList() {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
        }
      })
    },
    // 监听图片加载
    loadImage() {
      if (this.checkLoad) {
        this.$refs.scroll.refresh()
        this.checkLoad = true
      }
    },
    // 跳到子路由
    selectItem(item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      this.setDisc(item)
    },
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  components: {
    Slider,
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus">
  .recommend
    position: fixed
    bottom: 0
    width: 100%
    top:88px
    .recommend-content
      height:100%
      overflow:hidden
    .list-title
      color:#ffcd32
      height: 65px
      line-height: 65px
      text-align: center
    .discList
      .discList-item
        display:flex
        padding: 0 20px 20px
        box-sizing: border-box
        .discList-item-right
          margin-left: 10px
          .discList-item-name
            margin-bottom: 10px
          .discList-item-dissname
            color: hsla(0,0%,100%,.3)
    .loading-container
      position: fixed
      top: 50%
      transform: translate(0,-50%)
      width: 100%
</style>
