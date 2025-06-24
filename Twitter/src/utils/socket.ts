import { ObjectId } from 'mongodb'
import { verifyAccessToken } from '~/utils/commons'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { Server } from 'socket.io'
import Conversation from '~/models/schemas/Conversations.schema'
import databaseService from '~/services/database.services'
import { Server as HttpServer } from 'http'

const initSocket = (httpServer: HttpServer) => {
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
      socket.handshake.auth.access_token = access_token
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
    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        return next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        console.error('Unauthorized access attempt detected')
        socket.disconnect()
      }
    })
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
    })
  })
}

export default initSocket
