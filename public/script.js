const socket = io();
let currentRoom = '';
let username = '';

function joinRoom() {
  const usernameInput = document.getElementById('username-input');
  const roomInput = document.getElementById('room-input');
  const room = roomInput.value.trim();
  username = usernameInput.value.trim();

  if (username && room && room !== currentRoom) {
    if (currentRoom) {
      socket.emit('leaveRoom', currentRoom);
    }

    currentRoom = room;
    socket.emit('joinRoom', { room, username });
    document.getElementById('messages').innerHTML = '';
    appendMessage(`Você entrou na sala: ${room}`);
  }
}

function leaveRoom() {
  if (currentRoom) {
    socket.emit('leaveRoom', currentRoom);
    appendMessage(`Você saiu da sala: ${currentRoom}`);
    currentRoom = '';
  }
}

function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();

  if (message && currentRoom && username) {
    socket.emit('chatMessage', { room: currentRoom, username, message });
    messageInput.value = '';
  }
}

function appendMessage(message) {
  const messageDiv = document.getElementById('messages');
  const newMessage = document.createElement('div');
  newMessage.textContent = message;
  messageDiv.appendChild(newMessage);
  messageDiv.scrollTop = messageDiv.scrollHeight;
}

socket.on('message', (message) => {
  appendMessage(message);
});
