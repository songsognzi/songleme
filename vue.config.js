const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 生产环境用相对路径，部署到 GitHub Pages 的项目站点（用户名.github.io/仓库名/）也能正常加载资源
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/'
})
