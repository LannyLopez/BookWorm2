const path = require('path');
const express = require('express')
const app = express();
const server = require('http').createServer(app);
const socket = require('socket.io')
const io = socket(server)
const PORT = process.env.PORT || 3003;
const formatMessage = require('./utils/messages')
const Admin = "Server"
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/user')
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
   socket.on('joinRoom', ({ username, room }) =>{
    const user = userJoin(socket.id,username, room)
    socket.join(user.room)

    socket.emit('message', formatMessage(Admin, 'Welcome to BookWorm'))

    socket.broadcast.to(user.room).emit('message', formatMessage(Admin,`${user.username} has joined the Discussion`))

    io.to(user.room).emit('roomUsers',{
        room: user.room,
        users: getRoomUsers(user.room)
    })

   })
    
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        
        if(user) {
            io.to(user.room).emit('message', formatMessage(Admin, `${user.username} has left the discussion`))
        
            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
        
    })
})



server.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})