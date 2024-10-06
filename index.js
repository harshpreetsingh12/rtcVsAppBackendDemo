const express = require('express')
const {Server} = require('socket.io')
const bodyParser = require('body-parser')

const io = new Server({
    cors:true
})
const app =express();

app.use(bodyParser.json())

const emailtoSocketMap= new Map()
const socketEmailMap= new Map()

io.on('connection', (socket) => {
    console.log('new connection')
    socket.on('join-room', data =>{
        const {roomId, emailId} = data;
        console.log('user joined', emailId, 'joined room ', roomId)
        emailtoSocketMap.set(emailId, socket.id);
        socketEmailMap.set(socket.id, emailId);
        socket.join(roomId)
        socket.emit('joined_room', { roomId })
        socket.broadcast.to(roomId).emit('user-joined', {emailId})
    });
    socket.on('call-user',data => {
        const { emailId, offer } =data;
        const from = socketEmailMap.get(socket.id)
        const socketId = emailtoSocketMap.get(emailId);
        socket.to(socketId).emit('incoming-call', { from: from, offer:offer })
    })
    socket.on('call-accepted',data => {
        const { emailId, ans } =data;
        const socketId = emailtoSocketMap.get(emailId);
        socket.to(socketId).emit('call-accepted', { ans })
    })
})

app.listen(8000, ()=> console.log("http on 8000"))
io.listen(8001)