import { playMode } from '@/common/js/config'
import {loadSearch, loadPlay, loadFavorite} from '@/common/js/cache'
const state = {
  singer: {},
  // 播放状态
  playing: false,
  // 是否全屏
  fullScreen: false,
  // 播放列表
  playlist: [],
  // 当前播放模式列表
  sequenceList: [],
  // 播放模式
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
