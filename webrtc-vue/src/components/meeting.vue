<template>
  <body ref="body">
  <div class="container">
    <div class="main">

      <!--    videoBox-->

      <div ref="videoBox" class="videoBox">
        <template v-for="(info, id) in filteredUserInfoList">
          <div v-if="info.streamId != null" :key="id" class="videoWrapper">
            <div class="usernameSpan">
              <span>{{ info.name }}</span>
            </div>
            <div class="videoInfo">
              <img :src="info.audioMute ? require('../static/mic-off-red.svg') : require('../static/mic-green.svg')"
                   alt="">
              <img :src="info.videoMute ? require('../static/video-off-red.svg') : require('../static/video-green.svg')"
                   alt="">
            </div>
            <video :srcObject="streams[info.streamId]" :muted="muteState[info.streamId]" autoplay class="video"></video>
            <div class="videoControl">
              <img @click="controlRemoteAudio(info.streamId)"
                   :src="muteState[info.streamId] ? require('../static/volume-x.svg') : require('../static/volume-2-green.svg')"
                   alt="静音">
              <div v-if="streams[info.streamId]===localStream">
                  <select id="resolution" v-model="resolution" @change="onResolutionChange">
                    <option value=qvga>qvga</option>
                    <option value=vga>vga</option>
                    <option value=shd>shd</option>
                    <option value=hd>hd</option>
                    <option value=fhd>fhd</option>
                    <option value=qhd>qhd</option>
                  </select>
              </div>
              <div v-if="streams[info.streamId]!==localStream">
                <div>
                  <label><input type="radio" @click="controlSimulcast(streams[info.streamId],'high')" value="high" :name="info.streamId" checked/>High</label>
                </div>
                <div >
                  <label><input type="radio" @click="controlSimulcast(streams[info.streamId],'medium')" value="medium" :name="info.streamId" />Medium</label>
                </div>
                <div>
                  <label><input type="radio" @click="controlSimulcast(streams[info.streamId],'low')" value="low" :name="info.streamId" />Low</label>
                </div>
              </div>
            </div>
          </div>
          <div v-if="info.shareId != null" :key="id" class="videoWrapper">
            <div class="usernameSpan">
              <span>{{ info.name + '-Screen' }}</span>
            </div>
            <div class="videoInfo">
              <img :src="info.audioMute ? require('../static/mic-off-red.svg') : require('../static/mic-green.svg')"
                   alt="">
            </div>
            <video :srcObject="streams[info.shareId]" :muted="muteState[info.shareId]" autoplay class="video"></video>
            <div class="videoControl">
              <img @click="controlRemoteAudio(info.shareId)"
                   :src="muteState[info.shareId] ? require('../static/volume-x.svg') : require('../static/volume-2-green.svg')"
                   alt="静音">
            </div>
          </div>
        </template>
      </div>

      <!--          videoBox-->

      <!--    footer-->
      <footer>
        <!--    videoBtnBox-->
        <div class="controlBox">
          <button @click="controlLocalVideo" :disabled="!isPublishStream">
            <img :src="videoMute?require('../static/video-off.svg'):require('../static/video.svg')"
                 id="videoControlIcon" alt="">
          </button>
          <button @click="controlLocalAudio" :disabled="!isPublishStream">
            <img :src="audioMute?require('../static/mic-off.svg'):require('../static/mic.svg')" id="audioControlIcon"
                 alt="">
          </button>
          <button :style="isShareStream?{background: 'red'}:{}" ref="shareBtn" @click="controlShareStream"
                  :disabled="!isPublishStream">
            <img :src="require('../static/monitor.svg')" alt="">
          </button>
          <button :style="isPublishStream?{background: 'red'}:{background: 'limegreen'}" ref="callBtn"
                  @click="controlLocalStream">
            <img :src="isPublishStream?require('../static/phone-off.svg'):require('../static/phone-call.svg')" alt="">
          </button>
          <button @click="controlMessageBox">
            <img :src=" require('../static/message-square.svg')" alt="">
          </button>
          <button @click="controlUserInfoBox">
            <img :src="require('../static/users.svg')" alt="">
          </button>
          <button @click="controlChatGPTBox">
            <img :src="require('../static/help-circle.svg')" alt="">
          </button>
        </div>
        <!--    videoBtnBox end-->
      </footer>
      <!--    footer-->

    </div>

    <!--  messageBox-->
    <div class="messageBox" ref="messageBox">
      <h4>Chat</h4>
      <div class="messageInfo" ref="messageInfo">
        <div v-for="(message, index) in messages" :key="index">
          <div v-if="message.isSelf" class="selfMessage">
            <div>
              <span class="username">{{ userInfoList[message.socketId].name }}</span>
              <p>{{ message.text }}</p>
            </div>
            <img src="../static/Avatar.png" alt="">
          </div>
          <div v-else class="otherMessage">
            <img src="../static/Avatar.png" alt="">
            <div>
              <span class="username">{{ userInfoList[message.socketId].name }}</span>
              <p>{{ message.text }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="sendBox">
        <textarea v-model="messageText" placeholder="Write..." @keyup.enter="sendMessage" rows="3" cols="50"></textarea>
        <button class="icon-button" @click="sendMessage">
          <img src="../static/send.svg" alt="">
        </button>
      </div>
    </div>
    <!--  messageBox-->

    <!--    userInfoListBox -->
    <div class="userInfoListBox" ref="userInfoListBox">
      <h4>Participants</h4>
      <ul class="userInfoListUl">
        <li v-for="(userInfo, uid) in userInfoList" :key="uid" class="userInfoListLi">
          <div class="userWrapper">
            <div class="userAvatar">
              <img src="../static/Avatar.png"/>
            </div>
            <div class="userInfo">
              <span class="username">{{ userInfo.name }}</span>
            </div>
            <div class="userActions">
              <template v-if="userInfo.streamId">
                <button @click="controlRemoteAudio(userInfo.streamId)">
                  <img
                      :src="muteState[userInfo.streamId] ?require('../static/volume-x.svg') : require('../static/volume-2.svg')"/>
                </button>
              </template>
              <template v-else>
                no signal
              </template>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!--    userInfoListBox-->

    <!--    chatGPTBox-->
    <div class="chatGPTBox" ref="chatGPTBox">
      <h4>ChatGPT</h4>
      <div class="chatGPTInfo" ref="chatGPTInfo">
        <div v-for="(message, index) in chatGPTMessages" :key="index">
          <div v-if="message.sender === 'user'" class="selfMessage">
            <div @click="speakChatGPTMessage(message.text)">
              <p>{{ message.text }}</p>
            </div>
          </div>
          <div v-else class="otherMessage">
            <div @click="speakChatGPTMessage(message.text)">
              <p>{{ message.text }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="sendBox">
        <textarea v-model="chatGPTMessageText" placeholder="请输入您的问题..." @keyup.enter="sendChatGPTMessage" rows="3"
                  cols="50"></textarea>
        <button v-if="!isRecognizing" @click="startSpeechRecognition" :disabled="isRecognizing" class="icon-button">
          <img src="../static/mic.svg" alt="">
        </button>
        <button v-if="isRecognizing" @click="stopSpeechRecognition" :disabled="!isRecognizing" class="icon-button">
          <img src="../static/mic-off.svg" alt="">
        </button>
        <button class="icon-button" @click="sendChatGPTMessage">
          <img src="../static/send.svg" alt="">
        </button>
      </div>

    </div>
    <!--    chatGPTBox-->
  </div>
  </body>
</template>

<script>
import {Client, LocalStream} from 'ion-sdk-js';
import {IonSFUJSONRPCSignal} from 'ion-sdk-js/lib/signal/json-rpc-impl';
import io from 'socket.io-client';


export default {
  name: 'meetingVue',
  props: {
    msg: String
  },
  data() {
    return {
      publishStream: null,
      videoControlImgSrc: "",
      userInfoList: {},
      uid: null,
      streams: {},
      roomId: null,
      socket: null,
      resolution:"qvga",
      videoMute: null,
      audioMute: null,
      signalLocal: null,
      clientLocal: null,
      localUsername: null,
      localStream: null,
      shareStream: null,
      isPublishStream: false,
      isShareStream: false,

      muteState: [],
      remoteStreamMute: null,

      messageText: '',
      messages: [],


      chatGPTMessages: [
        {sender: 'bot', text: '您好，我是 ChatGPT。请问有什么可以帮您的？'},
      ],
      chatGPTMessageText: '', // 用户输入的文本
      finalTranscript: '', // 最终的语音转文字结果
      isRecognizing: false, // 是否正在语音输入中
      recognition: null, // 语音识别对象
      api: null,
      loadingMessageIndex: null,
      interimTranscript: '',

    }
  },
  methods: {
    initSocket() {
      //连接socket.io
      this.socket = io()
      this.socket.on("connect", () => {
        this.uid = this.socket.id
        this.userInfoList[this.uid] = {name: this.localUsername + '(self)', streamId: null, shareId: null,}
        if (this.publishStream) {
          this.getLocalStream()
        }
      });
      this.socket.on('user-disconnected', (socketId) => {
        delete this.userInfoList[socketId]
      })
      this.socket.on('join', (socketId, data) => {
        let {name, videoMute, audioMute} = JSON.parse(data);
        this.userInfoList[socketId] = {
          name: name, streamId: null, shareId: null, videoMute: videoMute,
          audioMute: audioMute
        }
        this.updateInfo()
      })
      this.socket.on('updateInfo', (socketId, data) => {
        let {name, streamId, shareId, videoMute, audioMute} = JSON.parse(data);
        this.userInfoList[socketId] = {
          name: name,
          streamId: streamId,
          shareId: shareId,
          videoMute: videoMute,
          audioMute: audioMute
        }
      })
      this.socket.on('message', (data) => {
        let message = JSON.parse(data);
        message.isSelf = false
        this.messages.push(message);
      })
      this.socket.on('chatGPT', (text) => {
        this.chatGPTMessages.splice(this.loadingMessageIndex, 1) // 删除“正在回答问题”的提示消息
        this.chatGPTMessages.push({sender: 'bot', text: text})
        this.$refs.chatGPTInfo.scrollTo(0, this.$refs.chatGPTInfo.scrollHeight);
        this.$nextTick(() => {
          this.$refs.chatGPTInfo.scrollTo(0, this.$refs.chatGPTInfo.scrollHeight);
        });
      })
    },
    async init() {
      this.roomId = this.$route.params.roomId;
      this.localUsername = sessionStorage.getItem('username');
      this.resolution = sessionStorage.getItem('resolution');
      this.videoMute = sessionStorage.getItem('videoMute') === "true";
      this.audioMute = sessionStorage.getItem('audioMute') === "true";
      this.remoteStreamMute = sessionStorage.getItem('remoteStreamMute') === "true";
      this.publishStream = sessionStorage.getItem('publishStream') === "true";


      //连接ION-SFU服务器，初始化ION-SFU客户端
      let serverUrl = "ws://localhost:7000/ws";
      let config = {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
        ],
      };

      this.signalLocal = new IonSFUJSONRPCSignal(serverUrl);
      this.clientLocal = new Client(this.signalLocal, config);
      await new Promise(resolve => {
        this.signalLocal.onopen = () => {
          this.clientLocal.join(this.roomId);
          this.initSocket()
          this.socket.emit('join', this.roomId, JSON.stringify({
            name: this.localUsername,
            videoMute: this.videoMute,
            audioMute: this.audioMute
          }));
          resolve();
        };
      });
      //拉取远方视频流
      this.clientLocal.ontrack = (track, stream) => {
        console.log("got track", track.id, "for stream", stream.id);
        track.onunmute = () => {
          // If the stream is not there in the streams map.
          if (!this.streams[stream.id]) {

            this.muteState[stream.id] = this.remoteStreamMute
            this.streams[stream.id] = stream;
            //监控流的关闭

            stream.onremovetrack = () => {
              try {
                if (this.streams[stream.id]) {
                  delete this.streams[stream.id];
                }
              } catch (err) {
                console.log(err)
              }
            };
          }
        };
      };
    },
    async getLocalStream() {
      await LocalStream.getUserMedia({
        resolution: this.resolution,
        audio: true,
        codec: "vp8",
      })
          .then((stream) => {
            this.localStream = stream;
            this.changeLocalAudio()
            this.changeLocalAudio()
            this.clientLocal.publish(stream);
            setTimeout(() => {
              this.isPublishStream = true
            }, 100)
            this.muteState[stream.id] = true
            this.streams[stream.id] = stream
            this.changeLocalAudio()
            this.changeLocalVideo()
            this.updateInfo()
            stream.oninactive = () => {
              if (this.streams[stream.id]) {
                delete this.streams[stream.id];
              }
              stream.unpublish();
              let tracks = stream.getTracks();
              tracks.forEach(track => {
                track.stop();
              });
              this.localStream = null
              this.shareStream = null
              this.updateInfo()
            }
          })
          .catch((err) => {
            this.isPublishStream = false
            console.error(err);
          });
    },


    controlSimulcast (stream,value) {
      stream.preferLayer(value);

    },

    updateInfo() {
      let streamId
      let shareId
      if (this.localStream === null) {
        streamId = null
      } else {
        streamId = this.localStream.id
      }
      if (this.shareStream === null) {
        shareId = null
      } else {
        shareId = this.shareStream.id
      }
      this.userInfoList[this.uid] = {
        name: this.localUsername + '(self)', streamId: streamId, shareId: shareId, videoMute: this.videoMute,
        audioMute: this.audioMute,
      }
      this.socket.emit('updateInfo', JSON.stringify({
        name: this.localUsername,
        streamId: streamId,
        shareId: shareId,
        videoMute: this.videoMute,
        audioMute: this.audioMute,
      }))
    },
    changeLocalVideo() {
      let videoTracks = this.localStream.getVideoTracks();
      if (videoTracks.length !== 0) {
        if (this.videoMute) {
          videoTracks[0].enabled = false;
        } else {
          videoTracks[0].enabled = true;
        }
      }
      this.updateInfo()
    },
    changeLocalAudio() {
      let audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length !== 0) {
        if (this.audioMute) {
          audioTracks[0].enabled = false;
        } else {
          audioTracks[0].enabled = true;
        }
      }
      this.updateInfo()
    },


    controlLocalVideo() {
      this.videoMute = !this.videoMute
      this.changeLocalVideo()
    },
    controlLocalAudio() {
      this.audioMute = !this.audioMute
      this.changeLocalAudio()
    },
    controlLocalStream() {
      if (this.localStream != null) {
        if (this.shareStream != null) {
          this.shareStream.unpublish();
          this.isShareStream = false;
          let tracks = this.shareStream.getTracks();
          // 停止所有的音视频轨道
          tracks.forEach(track => {
            track.stop();
          });
          this.shareStream = null
        }
        this.localStream.unpublish();
        let tracks = this.localStream.getTracks();
        // 停止所有的音视频轨道
        tracks.forEach(track => {
          track.stop();
        });
        this.isPublishStream = false
        this.localStream = null
        this.updateInfo()


        this.callIcon = require("../static/phone-call.svg")
      } else {
        this.getLocalStream()
        this.callIcon = require("../static/phone-off.svg")
      }
    },
    controlShareStream() {
      if (this.isShareStream) {
        // 如果当前正在屏幕分享

        // 停止屏幕分享流
        if (this.streams[this.shareStream.id]) {
          delete this.streams[this.shareStream.id];
        }
        this.shareStream.unpublish();
        this.isShareStream = false;
        // 停止所有的音视频轨道
        let tracks = this.shareStream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
        this.shareStream = null
        this.updateInfo()
      } else {
        // 如果当前未在屏幕分享

        // 获取屏幕分享流
        LocalStream.getDisplayMedia({
          resolution: "qvga",
          video: true,
          audio: true,
        }).then((stream) => {
          this.clientLocal.publish(stream);
          this.isShareStream = true;
          this.muteState[stream.id] = true
          this.streams[stream.id] = stream;
          this.shareStream = stream;
          this.updateInfo()


          stream.oninactive = () => {
            if (this.streams[stream.id]) {
              delete this.streams[stream.id];
            }
            stream.unpublish();
            this.isShareStream = false;
            // 停止所有的音视频轨道
            let tracks = stream.getTracks();
            tracks.forEach(track => {
              track.stop();
            });
            this.shareStream = null
            this.updateInfo()
            this.shareBtnBackColor = 'white'
          }
        }).catch((error) => {
          console.error(`Failed to start screen sharing: ${error}`);
        });
      }
    },
    controlMessageBox() {
      if (this.$refs.messageBox.classList.contains('active')) {
        this.$refs.messageBox.classList.toggle('active', false)
        this.$refs.body.classList.toggle('active', false)
        this.$refs.messageInfo.scrollTo(0, this.$refs.messageInfo.scrollHeight);
      } else {
        this.$refs.body.classList.toggle('active', true)
        this.$refs.messageBox.classList.toggle('active', true)
        this.$refs.chatGPTBox.classList.toggle('active', false)
        this.$refs.userInfoListBox.classList.toggle('active', false)
        this.$refs.messageInfo.scrollTo(0, this.$refs.messageInfo.scrollHeight);
      }
    },
    sendMessage() {
      if (this.messageText !== null) {
        const newMessage = {
          socketId: this.uid,
          text: this.messageText,
          isSelf: true,
        };
        this.socket.emit('message', JSON.stringify(newMessage))
        this.messages.push(newMessage);
        this.messageText = "";
        this.$refs.messageInfo.scrollTo(0, this.$refs.messageInfo.scrollHeight);
        this.$nextTick(() => {
          this.$refs.messageInfo.scrollTo(0, this.$refs.messageInfo.scrollHeight);
        });
      }
    },

    controlChatGPTBox() {
      if (this.$refs.chatGPTBox.classList.contains('active')) {
        this.$refs.chatGPTBox.classList.toggle('active', false)
        this.$refs.body.classList.toggle('active', false)
      } else {
        this.$refs.body.classList.toggle('active', true)
        this.$refs.chatGPTBox.classList.toggle('active', true)
        this.$refs.messageBox.classList.toggle('active', false)
        this.$refs.userInfoListBox.classList.toggle('active', false)
        this.$refs.chatGPTBox.scrollTo(0, this.$refs.chatGPTBox.scrollHeight);
      }
    },
    controlUserInfoBox() {
      if (this.$refs.userInfoListBox.classList.contains('active')) {
        this.$refs.userInfoListBox.classList.toggle('active', false)
        this.$refs.body.classList.toggle('active', false)
      } else {
        this.$refs.body.classList.toggle('active', true)
        this.$refs.userInfoListBox.classList.toggle('active', true)
        this.$refs.messageBox.classList.toggle('active', false)
        this.$refs.chatGPTBox.classList.toggle('active', false)
      }
    },

    controlRemoteAudio(streamId) {
      if (this.muteState[streamId] === true) {
        this.muteState[streamId] = false
      } else if (this.muteState[streamId] === false) {
        this.muteState[streamId] = true
      }
    },

    disconnect() {
      if (this.localStream != null) {
        this.localStream.unpublish()
        let tracks = this.localStream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
      }
      if (this.shareStream != null) {
        this.shareStream.unpublish()
        let tracks = this.shareStream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
      }
    },
    async sendChatGPTMessage() {
      await this.stopSpeechRecognition()
      this.isRecognizing = false;
      if (this.chatGPTMessageText !== "") {
        // 将用户输入的文本加入到消息数组中
        this.chatGPTMessages.push({sender: 'user', text: this.chatGPTMessageText})
        this.chatGPTMessageText = '';
        this.finalTranscript = '';
        setTimeout(() => {
          this.chatGPTMessageText = '';
          this.finalTranscript = '';
        }, 500)
        // 向 OpenAI 发送请求，获取机器人的回答
        const text = this.chatGPTMessages[this.chatGPTMessages.length - 1].text;

        this.chatGPTMessages.push({sender: 'bot', text: '正在回答问题，请稍等...'})
        this.loadingMessageIndex = this.chatGPTMessages.length - 1 // 获取这个消息的索引
        this.socket.emit('chatGPT', text)
        this.$refs.chatGPTInfo.scrollTo(0, this.$refs.chatGPTInfo.scrollHeight);
        this.$nextTick(() => {
          this.$refs.chatGPTInfo.scrollTo(0, this.$refs.chatGPTInfo.scrollHeight);
        });

      }
    },
    startSpeechRecognition() {
      // 创建语音识别对象
      this.recognition = new window.webkitSpeechRecognition();


      // 设置语音识别对象的属性
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'zh-CN';

      // 当语音识别对象返回结果时触发
      this.recognition.onresult = (event) => {
        this.interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.finalTranscript += transcript;
          } else {
            this.interimTranscript += transcript;
          }
        }
        // 将识别的结果显示在输入框中
        this.chatGPTMessageText = this.finalTranscript + this.interimTranscript;
      };

      // 当语音识别对象停止识别时触发
      this.recognition.onend = () => {
        this.isRecognizing = false;
        // 将最终的识别结果清空
        this.finalTranscript = '';
      };

      // 开始语音识别
      this.recognition.start();
      this.isRecognizing = true;
    },
    stopSpeechRecognition() {
      // 停止语音识别
      if (this.isRecognizing) {
        this.recognition.stop();
        this.isRecognizing = false;
      }
    },
    speakChatGPTMessage(text) {
      let msg = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(msg);
    },
    onResolutionChange(){
      this.getLocalStream()
    },
  },
  async mounted() {
    await this.init()
  }
  ,
  beforeUnmount() {
    this.disconnect()
  }
  ,
  computed: {
    filteredUserInfoList() {
      return Object.values(this.userInfoList).filter(info => info.streamId !== null)
    },
  },
  created() {
    window.MyData = this
  }
  ,
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}

button {
  cursor: pointer;
}

::-webkit-scrollbar {
  width: 0;
}

body {
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  padding: 0;
  min-width: 550px;
}

body .container {
  /*display: flex;*/
  /*flex-direction: column;*/
  /*height: 100vh;*/
  /*margin: 0;*/
  /*padding: 0;*/
}

body.container .main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  padding: 0;
}


/* videoBox */

body .container .main .videoBox {
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  min-height: calc(100vh - 100px);
}

body.active .container .main .videoBox {
  margin-right: 25rem;
}

body .container .main .videoBox .videoWrapper {
  margin: 5px;
  max-width: 700px;
  min-width: 400px;
  flex-grow: 1;
  flex-basis: 200px;
  position: relative;
  overflow: auto;
}

body .container .main .videoBox .videoWrapper .video {
  border-radius: 20px;
  width: 100%;
  height: calc(100vh * 9 / 16);
  object-fit: cover;
}


body .container .main .videoBox .videoWrapper .usernameSpan {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #fff;
  text-shadow: 1px 1px #000;
}

body .container .main .videoBox .videoWrapper .videoInfo {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #fff;
  text-shadow: 1px 1px #000;
}


body .container .main .videoBox .videoWrapper .videoControl {
  cursor: pointer;
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #fff;
  text-shadow: 1px 1px #000;
}

body .container .main .videoBox .videoWrapper .videoInfo .usernameSpan {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


/* videoBox */


/*footer*/
body .container .main footer {

  height: 90px;
  width: 100%;
  z-index: 1200;
  padding: 10px;
  position: sticky;
  bottom: 0;
  justify-content: center;
  align-items: center;
}

body .container .main footer .controlBox {
  z-index: 1200;
  position: absolute;
  bottom: 5px;
  width: 90%;
  left: 5%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f2f2;
  border-radius: 10px;
  padding: 20px;
  min-width: 550px;
}

body .container .main footer .controlBox button {
  border: none;
  height: 50px;
  width: 50px;
  text-decoration: none;
  border-radius: 50%;
  margin: 0 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  font-size: 1.3em;
  color: #333;
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);
}

body .container .main footer .controlBox button:hover {
  background: #333333;
  color: white;
}


/*footer*/


/*messageBox*/
.messageBox {
  position: fixed;
  right: -120%;
  height: 80%;
  width: 25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  padding: 30px 20px;
  z-index: 1300;
  background: #f5f2f2;
  transition: 0.5s ease-in-out;
  bottom: 150px;
  max-height: calc(100vh - 150px);
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);
}

.messageBox.active {
  right: 0;
}

.messageBox h4 {
  color: #333333;
  font-size: 1.5em;
}

.messageBox .messageInfo {
  display: flex;
  flex-direction: column;
  overflow: auto;
  scroll-behavior: smooth;
}

.messageBox .otherMessage {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 20px 0;
}

.messageBox .otherMessage img {
  position: relative;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.messageBox .otherMessage div {
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
}

.messageBox .otherMessage div span {
  word-wrap: break-word;
  max-width: 250px;
  color: grey;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-start;
  font-weight: bold;
}

.messageBox .otherMessage div p {
  max-width: 250px;
  word-wrap: break-word;
  display: flex;
  justify-content: flex-end;
  background: #f5f2f2;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);

}

.messageBox .selfMessage {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 0;
}

.messageBox .selfMessage img {
  position: relative;
  height: 50px;
  width: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 20px;
}

.messageBox .selfMessage div {
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
}

.messageBox .selfMessage div span {
  word-wrap: break-word;
  color: grey;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-end;
  font-weight: bold;
}

.messageBox .selfMessage div p {
  max-width: 250px;
  word-wrap: break-word;
  display: flex;
  justify-content: flex-end;
  background: #f5f2f2;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);

}

.messageBox .sendBox {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  background-color: #f7f7f7;
}


.messageBox .sendBox textarea {
  resize: none;
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: none;
  background-color: transparent;
  outline: none;
}

.messageBox .sendBox button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-left: 8px;
}

.messageBox .sendBox button:hover {
  cursor: default;
  opacity: 0.5;
}

/*messageBox*/


/*userInfoListBox*/
.userInfoListBox {
  position: fixed;
  right: -120%;
  height: 80%;
  width: 25rem;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  padding: 30px 20px;
  z-index: 1300;
  background: #f5f2f2;
  transition: 0.5s ease-in-out;
  bottom: 150px;
  max-height: calc(100vh - 150px);
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);

}

.userInfoListBox.active {
  right: 0;
}

.userInfoListBox h4 {
  color: #333333;
  font-size: 1.5em;
  margin-bottom: 20px;
}

.userInfoListBox .userInfoListUl {
  overflow: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

.userInfoListBox .userInfoListUl .userInfoListLi {
  margin: 10px;

}

.userInfoListBox .userInfoListUl .userInfoListLi .userWrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.userInfoListBox .userInfoListUl .userInfoListLi .userWrapper .userAvatar {
  margin-right: 10px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.userInfoListBox .userInfoListUl .userInfoListLi .userWrapper .userAvatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.userInfoListBox .userInfoListUl .userInfoListLi .userWrapper .userInfo {
  margin-left: 10px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.userInfoListBox .userInfoListUl .userInfoListLi .userWrapper .username {
  font-weight: bold;
}

.userInfoListBox .userInfoListUl .userInfoListLi .userWrapper .userActions {
  font-weight: bold;
  margin-right: 20px;
  display: flex
}

.userInfoListBox .userInfoListUl .userInfoListLi .userWrapper .userActions button {
  border: none;
  cursor: pointer;
  text-decoration: none;
  border-radius: 50%;
  margin: 0 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  font-size: 1.3em;
  color: #333;
}


/*chatGPTBox*/
.chatGPTBox {
  position: fixed;
  right: -120%;
  height: 80%;
  width: 25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 10px;
  padding: 30px 20px;
  z-index: 1300;
  background: #f5f2f2;
  transition: 0.5s ease-in-out;
  bottom: 150px;
  max-height: calc(100vh - 150px);
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);
}

.chatGPTBox.active {
  right: 0;
}

.chatGPTBox h4 {
  color: #333333;
  font-size: 1.5em;
}

.chatGPTBox .chatGPTInfo {
  display: flex;
  flex-direction: column;
  overflow: auto;
  scroll-behavior: smooth;
}

.chatGPTBox .otherMessage {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 20px 0;
}

.chatGPTBox .otherMessage div {
  margin-left: 10px;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
}


.chatGPTBox .otherMessage div p {
  max-width: 250px;
  word-wrap: break-word;
  display: flex;
  justify-content: flex-end;
  background: #f5f2f2;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);

}

.chatGPTBox .selfMessage {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 0;
}

.chatGPTBox .selfMessage div {
  margin-right: 10px;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
}

.chatGPTBox .selfMessage div p {
  max-width: 250px;
  word-wrap: break-word;
  display: flex;
  justify-content: flex-end;
  background: #f5f2f2;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);

}

.chatGPTBox .sendBox {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  background-color: #f7f7f7;
}


.chatGPTBox .sendBox textarea {
  resize: none;
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: none;
  background-color: transparent;
  outline: none;
}

.chatGPTBox .sendBox button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-left: 8px;
}

.chatGPTBox .sendBox button:hover {
  cursor: default;
  opacity: 0.5;
}


/*chatGPTBox*/


@media (max-width: 800px) {

}

@media screen and (min-height: 600px) {
  body {
    min-height: 600px;
  }
}

</style>
