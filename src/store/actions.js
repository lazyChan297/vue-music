import * as types from './mutation-types'
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from '@/common/js/cache'
import {shuffle} from '@/common/js/util'
import {playMode} from '@/common/js/config'
export const selectPlay = function({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

export const insertSong = function({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 当前正在播放的歌曲
  let currentSong = playlist[currentIndex]
  // 待插入歌曲是在当前播放列表中的索引 不存在返回-1
  let fpIndex = findIndex(playlist, song)
  currentIndex++
  playlist.splice(currentIndex, 0, song)
  // 如果插入的歌曲已经存在播放列表中,需要删掉原来已存在的
  if (fpIndex > -1) {
    // 插入的歌曲在原来已有的歌曲后面，删掉前面原有的
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      // 插入的歌曲在原来已有的前面，删掉后面原有的
      playlist.splice(fpIndex + 1, 1)
    }
  }
  // 待插入歌曲在顺序播放列表中的索引
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  // 待插入歌曲是否存在顺序播放列表中
  let fsIndex = findIndex(sequenceList, song)
  // 插入顺序播放列表
  sequenceList.splice(currentSIndex, 0, song)
  // 如果存在
  if (fsIndex > -1) {
    if (fsIndex > currentSIndex) {
      sequenceList.splice(currentSIndex, 1)
    } else {
      sequenceList.splice(currentIndex + 1, 1)
    }
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  // 如果删除的歌曲在当前播放歌曲的后面 or 删除的歌曲时最后一首歌
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // 如果歌曲删完，暂停播放
  if (!playlist.length) {
    commit(types.SET_PLAYING_STATE, false)
  } else {
    commit(types.SET_PLAYING_STATE, true)
  }
}

export const deleteSongList = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_PLAYING_STATE, false)
  commit(types.SET_CURRENT_INDEX, -1)
}

export const savePlayHistory = function({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function({commit}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function({commit}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
// 随机播放歌曲
export const randomPlay = function({commit}, {list}) {
  // 设置随机播放模式
  commit(types.SET_PLAY_MODE, playMode.random)
  // 将原始播放列表保存到sequenceList
  commit(types.SET_SEQUENCE_LIST, list)
  // 随机播放的列表
  let randomList = shuffle(list)
  // 将当前播放列表改为随机播放列表
  commit(types.SET_PLAYLIST, randomList)
  // 设置当前播放索引
  commit(types.SET_CURRENT_INDEX, 0)
  // 修改播放模式
  commit(types.SET_PLAYING_STATE, true)
  // 打开全屏
  commit(types.SET_FULL_SCREEN, true)
}
