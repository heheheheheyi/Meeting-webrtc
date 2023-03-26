# 基础镜像
FROM node:latest

# 拷贝项目文件
COPY . /app

# 工作目录
WORKDIR /app

# 安装依赖
RUN npm install

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
