import React, { Component } from 'react';
import SideBar from './../SideBar';
import {MESSAGE_SENT, TYPING, COMMUNITY_CHAT, MESSAGE_RECIEVED} from './../../Events'
import ChatHeading from './ChatHeading';
import Messages from './Messages';
import MessagesInput from './MessagesInput';

export default class ChatContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chats: [],
      activeChat: null
    }
  }
  componentDidMount() {
    const {socket} = this.props;
    socket.emit(COMMUNITY_CHAT, this.resetChat)
  }

  resetChat = (chat) => {
    return this.addChat(chat, true)
  }

  addChat = (chat, reset) => {
    const {socket} = this.props;
    const {chats} = this.state;

    const new_chats = reset ? [chat] : [...chats, chat]

    this.setState({chats: new_chats})

    const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}`;
    const typingEvent = `${TYPING}-${chat.id}`;

    socket.on(typingEvent, )
    socket.on(messageEvent, this.addMessageToChat(chat.id))
  }

  addMessageToChat = (chatId) => {
    return message => {
      const {chats} = this.state;
      let newChats = chats.map((chat) => {
        if(chat.id === chatId)
          chat.message.push(message)
        return chat
      })
      this.setState({chats: newChats})
    }
  }

  setActiveChat = (activeChat) => {
    this.setState({activeChat})
  }

  sendMessage = (chatId, message) => {
    const {socket} = this.props;
    socket.emit(MESSAGE_SENT, {chatId, message})
  }

  sendTyping = (chatId, isTyping) => {
    const {socket} = this.props;
    socket.emit(TYPING, {chatId, isTyping})
  }

  render() {
    const {user, logout} = this.props;
    const {chats, activeChat} = this.state;
    return (
      <div className="container">
        <SideBar
          logout={logout}
          chats={chats}
          user={user}
          activeChat={activeChat}
          setActiveChat={this.setActiveChat} />

        <div className="chat-room-container">
          {
            activeChat !== null ? (
              <div className="chat-room">
                <ChatHeading name={activeChat.name} />
                <Messages
                  messages={activeChat.messages}
                  user={user}
                  typingUser={activeChat.typingUser}
                />
                <MessagesInput
                  sendMessage={
                    (messages) => {
                      this.sendMessage(activeChat.id, messages)
                    }
                  }
                  sendTyping={
                    (isTyping) => {
                      this.sendTyping(activeChat.id, isTyping)
                    }
                  }
                />
              </div>
            )
            :
            <div id="chat-room choose">
              <h3>Choose a chat room</h3>
            </div>
          }
        </div>
      </div>
    );
  }
}
