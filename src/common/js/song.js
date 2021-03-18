import {getSongsUrl, getLyric} from '@/api/song'
import {ERR_OK} from '@/api/config'
import {Base64} from 'js-base64'

export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.name = name
    this.mid = mid
    this.singer = singer
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
  // 获取歌词 把base
  getLyric() {
    // 如果歌词存在,不再请求
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          // [hh:mm:ss] txt
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          // 歌词不存在
          reject(new Error('no lyric'))
        }
      })
    })
  }
}
// 创建歌曲实例
export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `http://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: musicData.url
  })
}

// 一首歌的歌手信息是一个数组
function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return
  }
  singer.forEach((item) => {
    ret.push(item.name)
  })
  // 最后返回string 如果有多个歌手用/分割
  return ret.join('/')
}

// 歌曲是否可以播放
export function isValidMusic(musicData) {
  return musicData.songid && musicData.albummid && (!musicData.pay || musicData.pay.payalbumprice === 0)
}

// 将请求到的音源url添加到songList...
export function processSongsUrl(songs) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }
  return getSongsUrl(songs).then((purlMap) => {
    songs = songs.filter((song) => {
      const purl = purlMap[song.mid]
      if (purl) {
        song.url = purl.indexOf('http') === -1 ? `http://dl.stream.qqmusic.qq.com/${purl}` : purl
        return true
      }
      return false
    })
    return songs
  })
}
