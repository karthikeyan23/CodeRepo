import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from '../chat.service';
import * as io from "socket.io-client";

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
  speechSynthesis: any;
}


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})


export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  chats: any;
  joinned: boolean = false;
  newUser = { nickname: '', userID: '' };
  msgData = { userID: '', nickname: '', message: '' };
  socket = io('http://localhost:4000');
  recognizing: boolean;
  voiceError: boolean;
  isVoiceChat: boolean;
  recognition: any;
  speechSynthesisObj: any;

  constructor(private chatService: ChatService) {

    const { webkitSpeechRecognition }: IWindow = <IWindow>window;
    const { SpeechRecognition }: IWindow = <IWindow>window;
    const { speechSynthesis }: IWindow = <IWindow>window;

    this.speechSynthesisObj = speechSynthesis;
    const SpeechRecognitionObj = SpeechRecognition || webkitSpeechRecognition;
    if (!SpeechRecognitionObj) {
      return;
    } else {
      this.recognition = new SpeechRecognitionObj();
      this.recognition.continuous = true;
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
      this.recognizing = false;
      this.voiceError = true;
      this.isVoiceChat = false;


      this.recognition.addEventListener('speechstart', () => {
        console.log('Speech has been detected.');
        this.recognizing = true;
      });

      this.recognition.addEventListener('result', (e) => {
        console.log('Result has been detected.');

        let last = e.results.length - 1;
        let text = e.results[last][0].transcript;

        console.log('Confidence: ' + e.results[0][0].confidence);
        this.msgData.message = text;
        console.log('Voice-to-text' + text);
        this.sendMessage();
        this.isVoiceChat = true;
      });

      this.recognition.addEventListener('speechend', () => {
        console.log('Speech has been stopped.');
        this.recognizing = false;
      });

      this.recognition.addEventListener('error', (e) => {
        console.log('Error: ' + e.error);
        this.voiceError = true;
      });
    }

  }

  ngOnInit() {
    var user = JSON.parse(localStorage.getItem("user"));
    if (user !== null) {
      this.getChatByID(user.userID);
      this.msgData = { userID: user.userID, nickname: user.nickname, message: '' }
      this.joinned = true;
      this.scrollToBottom();
    }
    this.socket.on('new-message', function (data) {
      if (data.message.userID === JSON.parse(localStorage.getItem("user")).userID) {
        this.chats.push(data.message);
        this.msgData = { userID: user.userID, nickname: user.nickname, message: '' }
        this.scrollToBottom();
        if (this.isVoiceChat && data.message.nickname == data.message.userID)
        {
          this.synthVoice(data.message.message);
          this.isVoiceChat = false;
        }
      }
    }.bind(this));
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  getChatByID(userID) {
    this.chatService.getChatByID(userID).then((res) => {
      this.chats = res;
    }, (err) => {
      console.log(err);
    });
  }

  loginUser() {
    var date = new Date();
    localStorage.setItem("user", JSON.stringify(this.newUser));
    this.getChatByID(this.newUser.userID);
    this.msgData = { userID: this.newUser.userID, nickname: this.newUser.nickname, message: '' };
    setTimeout(function() {
      //Authentication logic goes here
      console.log("Authentication complete");
      },1000);
    this.joinned = true;
    this.socket.emit('save-message', { userID: this.newUser.userID, nickname: this.newUser.nickname, message: 'Chat session started', updated_at: date });
  }

  sendMessage() {
    this.chatService.saveChat(this.msgData).then((result) => {
      this.socket.emit('save-message', result);
    }, (err) => {
      console.log(err);
    });
  }


  startVoice() {
    if (!this.recognizing) {
      console.log('Recognition start');
      this.recognition.start();
    }
  }


  stopVoice() {
    if (this.recognizing) {
      console.log('Recognition stop');
      this.recognition.stop();
    } else(this.voiceError)
    {
      this.recognizing = false;
      this.voiceError = false;
    }
  }

  synthVoice(text) {
    const synth = this.speechSynthesisObj;
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    synth.speak(utterance);
  }


  showSettings()
  {

  }

  logout() {
    var date = new Date();
    var user = JSON.parse(localStorage.getItem("user"));
    //this.socket.emit('save-message', { userID: user.userID, nickname: user.nickname, message: 'Chat session ended', updated_at: date });
    localStorage.removeItem("user");
    this.joinned = false;
  }

}