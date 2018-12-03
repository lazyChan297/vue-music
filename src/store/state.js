import {playMode} from '@/common/js/config'
import {loadSearch, loadPlay, loadFavorite} from '@/common/js/cache'
const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  // 播放列表
  playlist: [],
  // 播放模式列表
  sequenceList: [],
  mode: playMode.sequence,
  // 当前播放歌曲
  currentIndex: -1,
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
}

export default state
