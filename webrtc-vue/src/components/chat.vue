<template>
  <div class="chatbot-container">
    <div v-for="(message, index) in messages" :key="index" class="chat-window">
      <div :class="{  'sender-chat-box': message.sender === 'user', 'receiver-chat-box': message.sender === 'bot' }">

        <div v-if="message.sender === 'bot'" :class="{ 'chat-bubble': true, 'receiver': true }"
             @click="speakMessage(message.text)">
          {{ message.text }}
        </div>
        <div v-else :class="{ 'chat-bubble': true, 'sender': true }">
          {{ message.text }}
        </div>
      </div>

    </div>
    <div class="message-input-container">
      <input type="text" v-model="newMessageText" placeholder="请输入您的问题..." @keyup.enter="sendMessage">
      <div class="icon-buttons-container">
        <button @click="startSpeechRecognition" :disabled="isRecognizing" class="icon-button">
          <img src="../static/mic.svg" alt="">
        </button>
        <button @click="stopSpeechRecognition" :disabled="!isRecognizing" class="icon-button">
          <img src="../static/mic-off.svg" alt="">
        </button>
        <button type="submit" class="icon-button" @click="sendMessage">
          <img src="../static/send.svg" alt="">
        </button>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: "chatVue",
  data() {
    return {
      messages: [
        {sender: 'bot', text: '您好，我是 ChatGPT。请问有什么可以帮您的？'},
        {sender: 'user', text: '您好，我是 ChatGPT。请问有什么可以帮您的？'},
      ],
      newMessageText: '', // 用户输入的文本
      finalTranscript: '', // 最终的语音转文字结果
      isRecognizing: false, // 是否正在语音输入中
      recognition: null, // 语音识别对象
      socket: null,
      loadingMessageIndex: null,
      interimTranscript: '',
    }
  },
  methods: {
    init() {
      this.socket = window.io();
      this.socket.on("connect", () => {
        console.log('connect')
      });
      this.socket.on('chatGPT', (text) => {
        this.messages.splice(this.loadingMessageIndex, 1) // 删除“正在回答问题”的提示消息
        this.messages.push({sender: 'bot', text: text})
      })
    },
    async sendMessage() {
      await this.stopSpeechRecognition()
      this.isRecognizing = false;
      setTimeout(() => {
        this.newMessageText = '';
        this.finalTranscript = '';
      }, 100)
      if (this.newMessageText !== "") {
        // 将用户输入的文本加入到消息数组中
        this.messages.push({sender: 'user', text: this.newMessageText})

        // 向 OpenAI 发送请求，获取机器人的回答
        const text = this.messages[this.messages.length - 1].text;

        this.messages.push({sender: 'bot', text: '正在回答问题，请稍等...'})
        this.loadingMessageIndex = this.messages.length - 1 // 获取这个消息的索引
        this.socket.emit('chatGPT', text)

        console.log(this.newMessageText)
      }
    },
    startSpeechRecognition() {
      // 创建语音识别对象
      this.recognition = new window.webkitSpeechRecognition();


      // 设置语音识别对象的属性
      this.recognition.continuous = true;
      // this.recognition.interimResults = true;
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
        this.newMessageText = this.finalTranscript + this.interimTranscript;
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
      console.log('1')
      if (this.isRecognizing) {
        this.recognition.stop();
        this.isRecognizing = false;
      }
    },
    speakMessage(text) {
      let msg = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(msg);
    },

  },
  mounted() {
    this.init()
    setInterval(() => {
      console.log(this.isRecognizing)
      console.log(this.finalTranscript)
      console.log(this.newMessageText)
      console.log(this.interimTranscript)
    }, 10000)
  }
}
</script>

<style scoped>
.chat-bubble {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 20px;
  margin: 5px;
  max-width: 70%;
  word-wrap: break-word;
}

.sender {
  max-width: 250px;
  word-wrap: break-word;
  display: flex;
  justify-content: flex-end;
  background: #f5f2f2;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);
}

.receiver {
  max-width: 250px;
  word-wrap: break-word;
  display: flex;
  justify-content: flex-end;
  background: #f5f2f2;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0.2rem 0.2rem 1rem rgba(51, 51, 51, 0.2);
}

.sender-chat-box {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 20px 0;
}

.receiver-chat-box {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 20px 0;
}

.chat-window {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
}

.chatbot-container {
  font-family: Arial, Helvetica, sans-serif;
  border-radius: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  width: 400px;
  height: 600px;
}

input[type="text"] {
  flex: 1;
  height: 40px;
  border-radius: 20px;
  border: none;
  outline: none;
  font-size: 16px;
}

.message-input-container {
  display: flex;
  border-radius: 20px;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
}

.icon-buttons-container {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.icon-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-left: 10px;
}

.icon-button:hover {
  background-color: #f2f2f2;
}


</style>
