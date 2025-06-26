import express from 'express'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import mediasRouter from '~/routes/medias.routes'
import { initFolder } from '~/utils/file'
import { envConfig, isProduction } from '~/constants/config'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import staticRouter from '~/routes/static.routes'
import cors, { CorsOptions } from 'cors'
import tweetsRouter from '~/routes/tweets.routes'
import bookmarksRouter from '~/routes/bookmarks.routes'
import likesRouter from '~/routes/likes.routes'
import searchRouter from '~/routes/search.routes'
import { createServer } from 'http'
import conversationsRouter from '~/routes/conversations.routes'
import helmet from 'helmet'
import initSocket from '~/utils/socket'
import rateLimit from 'express-rate-limit'
// import YAML from 'yaml'
// import fs from 'fs'
// import path from 'path'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
// import '~/utils/fake'
// import '~/utils/s3'

// const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

const options: swaggerJsdoc.Options = {
  // failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
  definition: {
    openapi: '3.0.4',
    info: {
      title: 'X clone (Twitter API)',
      version: '1.0.0'
    }
    // components: {
    //   securitySchemes: {
    //     BearerAuth: {
    //       type: 'http',
    //       scheme: 'bearer',
    //       bearerFormat: 'JWT',
    //       description:
    //         'Sử dụng token JWT để xác thực. Token có thể được lấy sau khi đăng nhập thành công. Ví dụ: `Authorization: Bearer <token>`'
    //     }
    //   }
    // }
  },
  apis: ['./openapi/*.yaml']
}

const openapiSpecification = swaggerJsdoc(options)

const port = envConfig.port

const app = express()
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.

  // store: ... , // Redis, Memcached, etc. See below.
})
app.use(limiter) // Giới hạn số lượng request từ mỗi IP để bảo vệ ứng dụng khỏi tấn công DDoS
app.use(helmet()) // Bảo mật ứng dụng Express bằng cách thiết lập các tiêu đề HTTP an toàn

const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*' // Chỉ cho phép origin từ envConfig.corsOrigin trong môi trường production
}
app.use(cors(corsOptions))
const httpServer = createServer(app)

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
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

initSocket(httpServer)

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
