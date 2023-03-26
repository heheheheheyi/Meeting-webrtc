<template>
  <div class="container">
    <div class="video-container">
      <div class="videoWrapper">
        <div class="videoInfo">
          <img :src="initAudioMute==='true' ? require('../static/mic-off-red.svg') : require('../static/mic-green.svg')"
               alt="">
          <img :src="initVideoMute==='true' ? require('../static/video-off-red.svg') : require('../static/video-green.svg')"
               alt="">
        </div>
        <video :srcObject="initLocalStream" controls autoplay class="video" ></video>
      </div>
    </div>
    <div class="form-container">
      <h2>Enter Meeting Room</h2>
      <form @submit.prevent="joinMeeting">
        <div>
          <label for="roomName">Room Name:</label>
          <input type="text" id="roomName" v-model="roomName" :maxlength="30" required>
        </div>
        <div>
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" :maxlength="20" required>
        </div>
        <div>
          <label>Camera:</label>
          <select id="camera" v-model="initVideoMute" @change="onCameraChange">
            <option value=false>On</option>
            <option value=true>Off</option>
          </select>
        </div>
        <div>
          <label>Microphone:</label>
          <select id="microphone" v-model="initAudioMute" @change="onMicChange">
            <option value=false>On</option>
            <option value=true>Off</option>
          </select>
        </div>
        <div>
          <label>resolution:</label>
          <select id="resolution" v-model="resolution" @change="onResolutionChange">
            <option value=qvga>qvga</option>
            <option value=vga>vga</option>
            <option value=shd>shd</option>
            <option value=hd>hd</option>
            <option value=fhd>fhd</option>
            <option value=qhd>qhd</option>
          </select>
        </div>
        <div>
          <label>Mute Newcomers:</label>
          <select id="muteNewcomers" v-model="initRemoteStreamMute">
            <option value=false>Yes</option>
            <option value=true>No</option>
          </select>
        </div>
        <div>
          <label>PublishStream:</label>
          <select id="muteNewcomers" v-model="initPublishStream" @change="onCPublishStreamChange">
            <option value=true>Yes</option>
            <option value=false>No</option>
          </select>
        </div>
        <button type="submit">Join Meeting</button>
      </form>
    </div>
  </div>
</template>
<script>
import {LocalStream} from "ion-sdk-js";

export default {
  name: 'indexVue',
  data() {
    return {
      roomName: '',
      username: '',
      resolution:'qvga',
      initVideoMute: 'false',
      initAudioMute: 'false',
      initRemoteStreamMute: 'true',
      initPublishStream: 'true',
      initLocalStream: null,
    };
  },
  methods: {
    onResolutionChange(){
      this.init()
    },
    onCPublishStreamChange(){
      console.log('Camera changed: ' + this.initPublishStream)
      if (this.initPublishStream==='true'){
        this.init()
      } else {
        if(this.initLocalStream!==null){
          let tracks = this.initLocalStream.getTracks();
          // 停止所有的音视频轨道
          tracks.forEach(track => {
            track.stop();
          });
          this.initLocalStream = null
        }
      }
    },
    onCameraChange() {
      console.log('Camera changed: ' + this.initVideoMute);
      if (this.initLocalStream!=null){
        let videoTracks = this.initLocalStream.getVideoTracks();
        if (videoTracks.length !== 0) {
          if (this.initVideoMute==='true') {
            console.log('1')
            videoTracks[0].enabled = false;
          } else {
            console.log('2')
            console.log(this.initVideoMute)
            videoTracks[0].enabled = true;
          }
        }
      }

    },
    onMicChange() {
      console.log('Camera changed: ' + this.initVideoMute);
      if (this.initLocalStream!=null){
        let audioTracks = this.initLocalStream.getAudioTracks();
        if (audioTracks.length !== 0) {
          if (this.initVideoMute) {

            audioTracks[0].enabled = false;
          } else {
            audioTracks[0].enabled = true;
          }
        }
      }
    },
    async init() {
      await LocalStream.getUserMedia({
        resolution: this.resolution,
        audio: true,
        codec: "vp8",
      })
          .then((stream) => {
            console.log(stream)
            this.initLocalStream = stream;
          })
          .catch((err) => {
            console.error(err);
          })
    },
    joinMeeting() {
      // Form validation
      if (!this.roomName.trim() || !this.username.trim()) {
        alert('Please fill in all required fields.');
        return;
      }
      if (this.roomName.trim().length > 30 || this.username.trim().length > 20) {
        alert('Please enter a value within the maximum length.');
        return;
      }
      // Save user settings to session storage
      sessionStorage.setItem('username', this.username.trim());
      sessionStorage.setItem('audioMute', this.initAudioMute);
      sessionStorage.setItem('videoMute', this.initVideoMute);
      sessionStorage.setItem('remoteStreamMute', this.initRemoteStreamMute);
      sessionStorage.setItem('publishStream', this.initPublishStream);
      sessionStorage.setItem('resolution', this.resolution);

      // Redirect to meeting room
      this.$router.push('/meeting/' + this.roomName.trim());
    },
  },
  mounted() {
    this.init()
  },
  watch(){

  }
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.video-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-container {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  text-align: center;
}

h2 {
  margin-top: 0;
  font-size: 24px;
  font-weight: bold;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

label {
  display: block;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

input[type="text"],
select {
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
}

button[type="submit"] {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #4285f4;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type="submit"]:hover {
  background-color: #3367d6;
}

.videoWrapper {
  margin: 5px;
  border-radius: 20px;
  max-width: 700px;
  flex-grow: 1;
  flex-basis: 200px;
  min-width: 400px;
  position: relative;
  overflow: auto;
}

.videoInfo {
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

.video {
  border-radius: 20px;
  width: 100%;
  object-fit: cover;
}

</style>
