<template>
  <!-- <HelloWorld /> -->
   <MyVideo />
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import MyVideo from './components/MyVideo.vue'

export default {
  name: 'App',
  components: {
    // HelloWorld,
    MyVideo
  }
}
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}
</style>
