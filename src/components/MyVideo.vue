<template>
  <div class="page">
    <div class="phone">
      <!-- 模拟状态栏 -->
      <div class="status-bar">
        <span class="status-time">9:41</span>
        <span class="status-icons">
          <svg viewBox="0 0 18 12" width="17" height="11">
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
            <rect x="10" y="3" width="3" height="9" rx="1" />
            <rect x="15" y="0" width="3" height="12" rx="1" />
          </svg>
          <svg viewBox="0 0 26 12" width="25" height="11">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="#191919" stroke-width="1" />
            <rect x="2" y="2" width="16" height="8" rx="1.8" />
            <rect x="23" y="4" width="2.5" height="4" rx="1" />
          </svg>
        </span>
      </div>

      <!-- 顶部导航 -->
      <header class="nav">
        <button class="nav-btn" aria-label="返回" @click="goBack">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#191919" stroke-width="2">
            <path d="M15.5 4.5L8 12l7.5 7.5" />
          </svg>
        </button>
        <h1 class="nav-title">朋友圈</h1>
        <button class="nav-btn" aria-label="拍照" @click="tip('相机功能就先偷个懒吧~')">
          <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="#191919" stroke-width="1.7">
            <rect x="3" y="7" width="18" height="13" rx="3" />
            <circle cx="12" cy="13.5" r="3.4" />
            <path d="M8.4 7l1.3-2.2h4.6L15.6 7" />
          </svg>
        </button>
      </header>

      <main class="feed">
        <!-- 朋友圈封面 -->
        <section class="cover">
          <span class="snow s1">❄</span>
          <span class="snow s2">❄</span>
          <span class="snow s3">❄</span>
          <span class="snow s4">❄</span>
          <span class="snow s5">❄</span>
          <div class="cover-user">
            <span class="cover-nick">宋宋子</span>
            <div class="cover-avatar">宋</div>
          </div>
        </section>

        <!-- 动态 -->
        <article class="post">
          <div class="post-avatar">宋</div>

          <div class="post-main">
            <p class="post-name">宋宋子</p>
            <p class="post-time">1 分钟前</p>

            <p class="post-text">下雪了，第一件事就是拍下来给你看。❄️</p>

            <!-- 视频卡片 -->
            <div class="video-wrap">
              <video
                ref="video"
                :src="videoSrc"
                :poster="posterSrc"
                :controls="useNativeControls"
                preload="auto"
                playsinline
                webkit-playsinline
                x5-playsinline
                @loadedmetadata="onLoaded"
                @play="playing = true"
                @pause="playing = false"
                @ended="playing = false"
                @error="onVideoError"
                @timeupdate="onTimeUpdate"
              ></video>

              <!-- 用 button 铺满整块区域，避免 iOS / 微信里 video 吞掉点击 -->
              <button
                v-if="!useNativeControls"
                type="button"
                class="video-tap"
                :class="{ paused: !playing }"
                :aria-label="playing ? '暂停' : '播放'"
                @click="togglePlay"
              >
                <span v-if="!playing" class="play-btn">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>

              <span v-if="!useNativeControls" class="duration">{{ playing ? fmt(current) + ' / ' + fmt(duration) : fmt(duration) }}</span>

              <div v-if="playing && !useNativeControls" class="progress">
                <span :style="{ width: percent + '%' }"></span>
              </div>
            </div>

            <p class="location">武汉市 · 初雪</p>

            <!-- 点赞 / 评论 -->
            <div class="actions">
              <button class="action" :class="{ liked }" @click="liked = !liked">
                <svg viewBox="0 0 24 24" width="17" height="17"
                  :fill="liked ? '#e64340' : 'none'"
                  :stroke="liked ? '#e64340' : '#576b95'"
                  stroke-width="1.6">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{{ liked ? 24 : 23 }}</span>
              </button>

              <button class="action" @click="showComments = !showComments">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#576b95" stroke-width="1.6">
                  <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3v-4A8.5 8.5 0 1 1 21 11.5z" />
                </svg>
                <span>2</span>
              </button>

              <span class="dots">···</span>
            </div>

            <!-- 互动区 -->
            <div v-if="showComments" class="comments">
              <p><span class="comment-name">周老师：</span>好美，像你拍的每一帧。</p>
              <p><span class="comment-name">宋宋子 回复 周老师：</span>那下次带你一起看。</p>
            </div>
          </div>
        </article>

        <p class="feed-end">— 这里只有一条朋友圈 —</p>
      </main>

      <transition name="fade">
        <div v-if="tipText" class="toast">{{ tipText }}</div>
      </transition>
    </div>
  </div>
</template>

<script>
import winterVideo from '../assets/winter.mp4'
import winterPoster from '../assets/winter-poster.jpg'

export default {
  name: 'MyVideo',
  data() {
    return {
      videoSrc: winterVideo,
      posterSrc: winterPoster,
      // 触屏设备直接使用系统播放器控件，兼容性最好
      useNativeControls: false,
      playing: false,
      current: 0,
      duration: 0,
      liked: false,
      showComments: true,
      tipText: '',
      tipTimer: null
    }
  },
  computed: {
    percent() {
      return this.duration ? (this.current / this.duration) * 100 : 0
    }
  },
  mounted() {
    // 触屏设备交给系统播放器，避免自定义播放层在部分手机浏览器上被拦截
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      this.useNativeControls = true
    }
  },
  beforeUnmount() {
    if (this.tipTimer) clearTimeout(this.tipTimer)
  },
  methods: {
    togglePlay() {
      const video = this.$refs.video
      if (!video) return
      if (!video.paused) {
        video.pause()
        return
      }
      const attempt = video.play()
      if (attempt && attempt.catch) {
        // 部分手机浏览器会拦截有声播放，降级为静音后再试一次
        attempt.catch(() => {
          video.muted = true
          const retry = video.play()
          if (retry && retry.catch) retry.catch(() => {})
        })
      }
    },
    onLoaded(event) {
      this.duration = event.target.duration || 0
    },
    onVideoError() {
      this.tip('视频加载失败了，检查一下网络~')
    },
    onTimeUpdate(event) {
      this.current = event.target.currentTime || 0
    },
    fmt(seconds) {
      if (!seconds || !isFinite(seconds)) return '0:00'
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return m + ':' + (s < 10 ? '0' + s : s)
    },
    goBack() {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        this.tip('已经是第一条朋友圈啦')
      }
    },
    tip(text) {
      this.tipText = text
      if (this.tipTimer) clearTimeout(this.tipTimer)
      this.tipTimer = setTimeout(() => {
        this.tipText = ''
      }, 1800)
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #ececec;
  display: flex;
  justify-content: center;
}

.phone {
  position: relative;
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 0 28px rgba(0, 0, 0, 0.08);
}

.status-bar {
  height: 32px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #191919;
  background: #fff;
}

.status-icons {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  fill: #191919;
}

.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 46px;
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 0.5px solid #ededed;
}

.nav-title {
  margin: 0;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #191919;
}

.nav-btn {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  background: none;
  cursor: pointer;
}

.nav-btn:active {
  opacity: 0.5;
}

.cover {
  position: relative;
  height: 208px;
  overflow: hidden;
  background: linear-gradient(180deg, #c7d5e6 0%, #dfe9f3 46%, #f4f8fc 100%);
}

.cover::after {
  content: '';
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -46px;
  height: 110px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 -8px 26px rgba(148, 172, 200, 0.32);
}

.snow {
  position: absolute;
  color: #fff;
  opacity: 0.85;
  text-shadow: 0 2px 10px rgba(96, 130, 170, 0.35);
}

.s1 { left: 14%; top: 26px; font-size: 26px; }
.s2 { left: 44%; top: 62px; font-size: 16px; opacity: 0.6; }
.s3 { right: 20%; top: 30px; font-size: 20px; opacity: 0.7; }
.s4 { left: 26%; top: 116px; font-size: 13px; opacity: 0.55; }
.s5 { right: 8%; top: 108px; font-size: 15px; opacity: 0.5; }

.cover-user {
  position: absolute;
  right: 16px;
  bottom: 26px;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.cover-nick {
  padding-bottom: 8px;
  font-size: 15px;
  color: #fff;
  text-shadow: 0 1px 6px rgba(44, 62, 84, 0.45);
}

.cover-avatar {
  width: 66px;
  height: 66px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  border: 3px solid #fff;
  background: linear-gradient(135deg, #2c3e57, #6d829e);
  box-shadow: 0 4px 12px rgba(44, 62, 84, 0.2);
  color: #fff;
  font-size: 23px;
  font-weight: 600;
}

.post {
  display: flex;
  gap: 10px;
  padding: 18px 16px 26px;
}

.post-avatar {
  flex: none;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: linear-gradient(135deg, #2c3e57, #6d829e);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.post-main {
  flex: 1;
  min-width: 0;
}

.post-name {
  margin: 0;
  color: #576b95;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.3;
}

.post-time {
  margin: 3px 0 0;
  color: #b2b2b2;
  font-size: 12px;
}

.post-text {
  margin: 10px 0 0;
  color: #191919;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
}

.video-wrap {
  position: relative;
  margin-top: 10px;
  width: 100%;
  aspect-ratio: 1080 / 612;
  border-radius: 4px;
  overflow: hidden;
  background: #0d1520;
  cursor: pointer;
}

.video-wrap video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #0d1520;
}

.video-tap {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.video-tap.paused {
  background: rgba(0, 0, 0, 0.1);
}

.video-tap:active .play-btn {
  transform: scale(0.94);
}

.play-btn {
  pointer-events: none;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.8);
  background: rgba(0, 0, 0, 0.42);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.duration {
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 3;
  pointer-events: none;
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.48);
  color: #fff;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  pointer-events: none;
  height: 2px;
  background: rgba(255, 255, 255, 0.28);
}

.progress span {
  display: block;
  height: 100%;
  background: #fff;
  transition: width 0.2s linear;
}

.location {
  margin: 10px 0 0;
  color: #576b95;
  font-size: 13px;
}

.actions {
  margin-top: 12px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  background: #f7f7f7;
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 6px;
  border: 0;
  background: none;
  color: #576b95;
  font-size: 13px;
  cursor: pointer;
}

.action:active {
  opacity: 0.6;
}

.action.liked span {
  color: #e64340;
}

.dots {
  margin-left: auto;
  padding-right: 4px;
  color: #b2b2b2;
  font-size: 15px;
  letter-spacing: 1px;
}

.comments {
  margin-top: 8px;
  padding: 9px 10px;
  border-radius: 4px;
  background: #f7f7f7;
  font-size: 13px;
  line-height: 1.65;
  color: #191919;
}

.comments p {
  margin: 0;
}

.comments p + p {
  margin-top: 2px;
}

.comment-name {
  color: #576b95;
}

.feed-end {
  margin: 0;
  padding: 8px 0 34px;
  text-align: center;
  color: #c8c8c8;
  font-size: 12px;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 64px;
  transform: translateX(-50%);
  padding: 9px 16px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 13px;
  white-space: nowrap;
  z-index: 20;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 430px) {
  .phone {
    box-shadow: none;
  }
}
</style>
