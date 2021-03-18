<template lang="html">
  <div class="song-list">
    <ul>
      <li
        v-for="(song, index) in songs"
        :key="index"
        @click="selectItem(song,index)"
        class="song-list-item">
        <div class="rank-wrapper" v-show="rank">
          <span :class="getRankCla(index)">{{getRankText(index)}}</span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{_getDesc(song)}}</p>
        </div>
      </li>
    </ul>

  </div>
</template>

<script>
export default {
  props: {
    songs: {
      type: Array,
      default: null
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    _getDesc(song) {
      return `${song.singer}.${song.album} `
    },
    selectItem(item, index) {
      this.$emit('select', item, index)
    },
    getRankCla(index) {
      if (index <= 2) {
        return `icon icon${index}`
      } else {
        return 'text'
      }
    },
    getRankText(index) {
      if (index > 2) {
        return index + 1
      }
    }
  }
}
</script>

<style lang="stylus">
@import "~common/stylus/variable"
@import "~common/stylus/mixin"

  .song-list
    font-size:14px
    .song-list-item
      display: flex
      align-items: center
      height:64px
      line-height:20px
      width: 100%
      .content
        width: 100%
        .name
          text-overflow: ellipsis
          white-space: nowrap
          overflow: hidden
          color: $color-text
          font-weight: bold
      .desc
        color:$color-text-l
        color: rgba(255,255,255,0.5)
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis
      .rank-wrapper
        flex: 0 0 25px
        margin-right: 30px
        width: 25px
        text-align: center
        .icon
          display: inline-block
          width: 25px
          height: 24px
          background-size: 25px 24px
          &.icon0
            bg-image('first')
          &.icon1
            bg-image('second')
          &.icon2
            bg-image('third')
        .text
          color: $color-text
          font-size: $font-size-large
</style>
