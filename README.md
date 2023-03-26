### 启动Node.js服务器
```
npm install
node server.js
```

### 启动ION SFU服务器
```go 
cd ion-sfu-master
go build ./cmd/signal/json-rpc/main.go
./main -c config.toml -key -a ":7000"
```

### 打开浏览器
```
http://localhost:3000
```
