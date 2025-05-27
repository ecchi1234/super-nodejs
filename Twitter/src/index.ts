import express, { Request, Response, NextFunction } from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from '~/routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from '~/routes/static.routes'
import cors from 'cors'
import tweetsRouter from '~/routes/tweets.routes'
import bookmarksRouter from '~/routes/bookmarks.routes'
import likesRouter from '~/routes/likes.routes'
import searchRouter from '~/routes/search.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
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

io.on('connection', (socket) => {
  console.log(`${socket.id} user connected`)
  socket.on('disconnect', () => {
    console.log(`${socket.id} user disconnected`)
  })
  socket.on('hello', (arg) => {
    console.log(arg)
  })
  socket.emit('hi', {
    message: `Xin chào ${socket.id} đã kết nối thành công!`
  })
})

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
