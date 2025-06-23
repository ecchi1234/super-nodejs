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
import { verifyAccessToken } from '~/utils/commons'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
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

io.use(async (socket, next) => {
  console.log(socket.id, socket.handshake.auth)
  const { Authorization } = socket.handshake.auth

  const access_token = Authorization?.split(' ')[1]

  try {
    const decoded_authorization = await verifyAccessToken(access_token)
    const { verify } = decoded_authorization as TokenPayload

    if (verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: USERS_MESSAGES.USER_NOT_VERIFIED
      })
    }
    // Truyền decoded_authorization vào socket.handshake.auth
    socket.handshake.auth.decoded_authorization = decoded_authorization
    next()
  } catch (error) {
    next({
      message: 'Unauthorized',
      name: 'UnauthorizedError',
      data: error
    })
  }
})

io.on('connection', (socket) => {
  console.log(`${socket.id} user connected`)
  const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
  users[user_id] = {
    socket_id: socket.id
  }
  socket.on('send_message', async (data) => {
    const { payload } = data
    const receiver_socket_id = users[payload.receiver_id]?.socket_id

    const conversation = new Conversation({
      sender_id: new ObjectId(payload.sender_id),
      receiver_id: new ObjectId(payload.receiver_id),
      content: payload.content
    })
    const result = await databaseService.conversations.insertOne(conversation)

    conversation._id = result.insertedId

    if (!receiver_socket_id) {
      console.log(`No socket found for receiver_id: ${payload.receiver_id}`)
      return
    }

    socket.to(receiver_socket_id).emit('receive_message', {
      payload: conversation
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
