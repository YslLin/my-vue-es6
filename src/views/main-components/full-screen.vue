<!-- 全屏 -->
<template>
  <div @click="handleChange" v-if="showFullScreenBtn" class="full-screen-btn-con">
    <Tooltip :content="value ? '退出全屏' : '全屏'">
      <Icon :type="value ? 'arrow-shrink' : 'arrow-expand'" :size="23"></Icon>
    </Tooltip>
  </div>
</template>

<script>
export default {
  name: 'full-screen',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    showFullScreenBtn () {
      return window.navigator.userAgent.indexOf('MSIE') < 0
    }
  },
  methods: {
    handleFullscreen () {
      let main = document.body
      if (this.value) { // 取消全屏
        if (document.exitFullscreen) { // W3C
          document.exitFullscreen()
        } else if (document.mozCancelFullScreen) { // FireFox
          document.mozCancelFullScreen()
        } else if (document.webkitCancelFullScreen) { // Chrome
          document.webkitCancelFullScreen()
        } else if (document.msExitFullscreen) { // IE
          document.msExitFullscreen()
        }
      } else { // 请求全屏
        if (main.requestFullscreen) {
          main.requestFullscreen()
        } else if (main.mozRequestFullScreen) {
          main.mozRequestFullScreen()
        } else if (main.webkitRequestFullScreen) {
          main.webkitRequestFullScreen()
        } else if (main.msRequestFullscreen) {
          main.msRequestFullscreen()
        }
      }
    },
    handleChange () {
      this.handleFullscreen()
    }
  },
  created () {
    let isFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen
    isFullscreen = !!isFullscreen
    document.addEventListener('fullscreenchange', () => {
      this.$emit('input', !this.value)
    })
    document.addEventListener('mozfullscreenchange', () => {
      this.$emit('input', !this.value)
    })
    document.addEventListener('webkitfullscreenchange', () => {
      this.$emit('input', !this.value)
    })
    document.addEventListener('msfullscreenchange', () => {
      this.$emit('input', !this.value)
    })
    this.$emit('input', isFullscreen)
  }
}
</script>

<style>

</style>
