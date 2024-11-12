const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room);
    socket.username = username;
    rooms[room] = rooms[room] || [];
    rooms[room].push(socket.id);

    // Notificar outros usuários na sala que o usuário entrou
    socket.to(room).emit('message', `${username} entrou na sala ${room}`);
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    rooms[room] = rooms[room].filter(id => id !== socket.id);

    // Notificar outros usuários na sala que o usuário saiu
    socket.to(room).emit('message', `${socket.username} saiu da sala ${room}`);
  });

  socket.on('chatMessage', ({ room, username, message }) => {
    // Enviar a mensagem para todos na sala
    io.to(room).emit('message', `${username}: ${message}`);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${socket.id}`);
    for (const room in rooms) {
      if (rooms[room].includes(socket.id)) {
        socket.to(room).emit('message', `${socket.username} saiu da sala ${room}`);
        rooms[room] = rooms[room].filter(id => id !== socket.id);
      }
    }
  });
});

// Iniciar o servidor
server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
