const io = require('./index.js').io


const {VERIFY_USER, USER_CONNECTED,LOGOUT, COMMUNITY_CHAT, MESSAGE_SENT, TYPING, USER_DISCONNECTED} = require('./../Events')
const { createUser, createMessage, createChat} = require('./../Factories')

let connectedUsers = {}
let communityChat = createChat()

module.exports  = function(socket) {
  console.log("Socket id:" + socket.id)

  // verify username
  socket.on(VERIFY_USER, (nickname, callback) => {
    if(isUser(connectedUsers,nickname)) {
      callback({isUser: true, user:null})
    } else {
      callback({isUser: false, user: createUser({name: nickname})})
    }
  })

  socket.on(USER_CONNECTED, (user) => {
    connectedUsers = addUser(connectedUsers, user)
    socket.user = user

    io.emit(USER_CONNECTED, connectedUsers)
    console.log(connectedUsers)
  })

  //User disconnects
  socket.on('disconnect', ()=>{
    if("user" in socket){
      connectedUsers = removeUser(connectedUsers, socket.user.name)

      io.emit(USER_DISCONNECTED, connectedUsers)
      console.log("Disconnect", connectedUsers);
    }
  })


  //User logsout
  socket.on(LOGOUT, ()=>{
    connectedUsers = removeUser(connectedUsers, socket.user.name)
    io.emit(USER_DISCONNECTED, connectedUsers)
    console.log("Disconnect", connectedUsers);

  })

  //Get Community Chat
  socket.on(COMMUNITY_CHAT, (callback)=>{
    callback(communityChat)
  })

  socket.on(MESSAGE_SENT, ({chatId, message})=>{
    sendMessageToChatFromUser(chatId, message)
  })

  socket.on(TYPING, ({chatId, isTyping})=>{
    sendTypingFromUser(chatId, isTyping)
  })
}

function addUser(usersList, user) {
  let newList = Object.assign({}, usersList)
  newList[user.name] = user
  return newList
}
function removeUser(usersList, username) {
  let newList = Object.assign({}, usersList)
  delete newList[username]

  return newList
}
function isUser(usersList, username) {
  return username in usersList
}

function sendMessageToChat(sender){
  return (chatId, message)=>{
    io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({message, sender}))
  }
}

function sendTypingToChat(user){
  return (chatId, isTyping)=>{
    io.emit(`${TYPING}-${chatId}`, {user, isTyping})
  }
}
