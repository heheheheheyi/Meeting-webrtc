const {defineConfig} = require('@vue/cli-service');
//引用path
const path = require("path");
//引用fs
const fs = require("fs");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // 是否自动打开浏览器
    open: false,
    client: {
      webSocketURL: 'ws://0.0.0.0:8080/ws',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }
})
