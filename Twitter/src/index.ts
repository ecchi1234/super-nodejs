import express, { Request, Response, NextFunction } from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import mediasRouter from '~/routes/medias.routes'
import { initFolder } from '~/utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import staticRouter from '~/routes/static.routes'
import cors from 'cors'
import tweetsRouter from '~/routes/tweets.routes'
import bookmarksRouter from '~/routes/bookmarks.routes'
import likesRouter from '~/routes/likes.routes'
import searchRouter from '~/routes/search.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
import Conversation from '~/models/schemas/Conversations.schema'
import conversationsRouter from '~/routes/conversations.routes'
import { ObjectId } from 'mongodb'
// import '~/utils/fake'
// import '~/utils/s3'

config()

const port = process.env.PORT || 4000

const app = express()
const httpServer = createServer(app)
app.use(cors())

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexVideoStatus()
  databaseService.indexRefreshTokens()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})

// const mgcClient = new MongoClient(
//   `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.j75pm.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`
// )

// const db = mgcClient.db('earth')

// // Tạo 1000 document vào collection users
// const users = db.collection('users')

// const usersData = []
// function getRandomNumber() {
//   return Math.floor(Math.random() * 100) + 1
// }

// for (let i = 0; i < 1000; i++) {
//   usersData.push({
//     name: 'user' + (i + 1),
//     age: getRandomNumber(),
//     gender: i % 2 === 0 ? 'male' : 'female',
//     address: i === 23 ? 'Hoa Binh, Viet Nam' : ''
//   })
// }

// users.insertMany(usersData)

//tạo folder upload
initFolder()

app.use(express.json())

app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/search', searchRouter)
app.use('/conversations', conversationsRouter)
// serve static file cách 2: sử dụng router
app.use('/static', staticRouter)
// serve static file cách 1: sử dụng express.static
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000' // hoặc địa chỉ frontend của bạn
  }
})

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  console.log(`${socket.id} user connected`)
  console.log(socket.handshake.auth)
  const user_id = socket.handshake.auth._id
  users[user_id] = {
    socket_id: socket.id
  }
  console.log(users)

  socket.on('private message', async (data) => {
    const receiver_socket_id = users[data.to]?.socket_id
    if (!receiver_socket_id) return
    await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: new ObjectId(data.from),
        receiver_id: new ObjectId(data.to),
        content: data.content
      })
    )
    socket.to(receiver_socket_id).emit('receive private message', {
      content: data.content,
      from: user_id
    })
  })
  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`${socket.id} user disconnected`)
    console.log(users)
  })
})

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
